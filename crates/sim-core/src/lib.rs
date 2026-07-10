//! Deterministic reference-compatible signal core for NullForge Simulation Lab.
//!
//! The initial scope intentionally mirrors the small Python oracle:
//! sine/additive sources, linear phase automation, L/R/C routing, M/S derivation
//! and null-depth metrics. Geometry and visualization are deliberately absent
//! from the audio calculation.

use std::collections::BTreeMap;
use std::f64::consts::PI;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize)]
pub struct Experiment {
    pub experiment_id: String,
    pub engine: Engine,
    pub timeline: Timeline,
    pub sources: Vec<Source>,
    #[serde(default)]
    pub automation: Vec<AutomationTrack>,
    #[serde(default)]
    pub visualization: serde_json::Value,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Engine {
    pub sample_rate: u32,
    pub render_seed: u64,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Timeline {
    pub duration_samples: usize,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Source {
    pub id: String,
    pub generator: Generator,
    pub frequency_hz: f64,
    pub amplitude: f64,
    pub phase_deg: f64,
    #[serde(default)]
    pub partials: Vec<Partial>,
    pub channel: Channel,
}

#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Generator {
    Sine,
    Additive,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Partial {
    pub harmonic: u32,
    pub amplitude: f64,
    #[serde(default)]
    pub phase_offset_deg: f64,
}

#[derive(Debug, Clone, Copy, Deserialize)]
pub enum Channel {
    #[serde(rename = "L")]
    Left,
    #[serde(rename = "R")]
    Right,
    #[serde(rename = "C")]
    Center,
}

#[derive(Debug, Clone, Deserialize)]
pub struct AutomationTrack {
    pub target: String,
    pub curve: Curve,
    pub keys: Vec<AutomationKey>,
}

#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Curve {
    Step,
    Linear,
    CubicBezier,
    CatmullRom,
    SampledCurve,
}

#[derive(Debug, Clone, Copy, Deserialize)]
pub struct AutomationKey {
    pub sample: usize,
    pub value: f64,
}

#[derive(Debug, Clone, Serialize)]
pub struct SourceState {
    pub phase_deg_start: f64,
    pub phase_deg_end: f64,
    pub frequency_hz: f64,
    pub amplitude: f64,
    pub channel: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Metrics {
    pub sample_rate: u32,
    pub duration_samples: usize,
    pub duration_seconds: f64,
    pub left_rms: f64,
    pub right_rms: f64,
    pub center_rms: f64,
    pub side_rms: f64,
    pub global_center_null_depth_db: f64,
    pub deepest_null_sample: usize,
    pub deepest_null_time_seconds: f64,
    pub deepest_null_db_10ms: f64,
    pub source_states: BTreeMap<String, SourceState>,
}

#[derive(Debug, Clone)]
pub struct RenderResult {
    pub left: Vec<f64>,
    pub right: Vec<f64>,
    pub physical_center: Vec<f64>,
    pub center: Vec<f64>,
    pub side: Vec<f64>,
    pub metrics: Metrics,
}

#[derive(Debug)]
pub enum RenderError {
    EmptyTimeline,
    InvalidSampleRate,
    UnsupportedAutomation { target: String, curve: Curve },
    EmptyAutomation { target: String },
    InvalidPartial { source_id: String, harmonic: u32 },
}

impl std::fmt::Display for RenderError {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::EmptyTimeline => write!(formatter, "duration_samples must be greater than zero"),
            Self::InvalidSampleRate => write!(formatter, "sample_rate must be greater than zero"),
            Self::UnsupportedAutomation { target, curve } => {
                write!(formatter, "unsupported automation curve {curve:?} for {target}")
            }
            Self::EmptyAutomation { target } => {
                write!(formatter, "automation track {target} has no keys")
            }
            Self::InvalidPartial {
                source_id,
                harmonic,
            } => write!(
                formatter,
                "source {source_id} contains invalid harmonic index {harmonic}"
            ),
        }
    }
}

impl std::error::Error for RenderError {}

/// Render one experiment. Visualization metadata is never consulted.
pub fn render(experiment: &Experiment) -> Result<RenderResult, RenderError> {
    let sample_rate = experiment.engine.sample_rate;
    let sample_count = experiment.timeline.duration_samples;

    if sample_rate == 0 {
        return Err(RenderError::InvalidSampleRate);
    }
    if sample_count == 0 {
        return Err(RenderError::EmptyTimeline);
    }

    let mut left = vec![0.0_f64; sample_count];
    let mut right = vec![0.0_f64; sample_count];
    let mut physical_center = vec![0.0_f64; sample_count];
    let mut source_states = BTreeMap::new();

    for source in &experiment.sources {
        let phase_target = format!("{}.phase_deg", source.id);
        let phase_track = experiment
            .automation
            .iter()
            .find(|track| track.target == phase_target);

        if let Some(track) = phase_track {
            if !matches!(track.curve, Curve::Linear) {
                return Err(RenderError::UnsupportedAutomation {
                    target: track.target.clone(),
                    curve: track.curve,
                });
            }
            if track.keys.is_empty() {
                return Err(RenderError::EmptyAutomation {
                    target: track.target.clone(),
                });
            }
        }

        let phase_start = phase_at_sample(source.phase_deg, phase_track, 0)?;
        let phase_end = phase_at_sample(source.phase_deg, phase_track, sample_count - 1)?;
        source_states.insert(
            source.id.clone(),
            SourceState {
                phase_deg_start: phase_start,
                phase_deg_end: phase_end,
                frequency_hz: source.frequency_hz,
                amplitude: source.amplitude,
                channel: channel_name(source.channel).to_owned(),
            },
        );

        let normalized_partials = normalized_partials(source)?;
        for sample in 0..sample_count {
            let phase_deg = phase_at_sample(source.phase_deg, phase_track, sample)?;
            let phase_radians = phase_deg.to_radians();
            let time_seconds = sample as f64 / f64::from(sample_rate);

            let unit_value = match source.generator {
                Generator::Sine => {
                    (2.0 * PI * source.frequency_hz * time_seconds + phase_radians).sin()
                }
                Generator::Additive => normalized_partials
                    .iter()
                    .map(|partial| {
                        let frequency = source.frequency_hz * f64::from(partial.harmonic);
                        let phase = phase_radians + partial.phase_offset_deg.to_radians();
                        partial.amplitude * (2.0 * PI * frequency * time_seconds + phase).sin()
                    })
                    .sum(),
            };

            let value = source.amplitude * unit_value;
            match source.channel {
                Channel::Left => left[sample] += value,
                Channel::Right => right[sample] += value,
                Channel::Center => physical_center[sample] += value,
            }
        }
    }

    let mut center = vec![0.0_f64; sample_count];
    let mut side = vec![0.0_f64; sample_count];
    let mut reference = vec![0.0_f64; sample_count];

    for sample in 0..sample_count {
        center[sample] = (left[sample] + right[sample]) / 2.0 + physical_center[sample];
        side[sample] = (left[sample] - right[sample]) / 2.0;
        reference[sample] = (left[sample].abs() + right[sample].abs()) / 2.0;
    }

    let window = usize::max(64, (f64::from(sample_rate) * 0.010) as usize);
    let center_curve = centered_rms_curve(&center, window);
    let reference_curve = centered_rms_curve(&reference, window);

    let null_curve: Vec<f64> = center_curve
        .iter()
        .zip(&reference_curve)
        .map(|(numerator, denominator)| db_ratio(*numerator, *denominator, -300.0))
        .collect();

    let guard = window;
    let search_start = if sample_count > 2 * guard { guard } else { 0 };
    let search_end = if sample_count > 2 * guard {
        sample_count - guard
    } else {
        sample_count
    };

    let (deepest_null_sample, deepest_null_db_10ms) = null_curve[search_start..search_end]
        .iter()
        .enumerate()
        .min_by(|(_, left_value), (_, right_value)| left_value.total_cmp(right_value))
        .map_or((0, null_curve[0]), |(offset, value)| {
            (search_start + offset, *value)
        });

    let left_rms = rms(&left);
    let right_rms = rms(&right);
    let center_rms = rms(&center);
    let side_rms = rms(&side);
    let reference_rms = rms(&reference);

    let metrics = Metrics {
        sample_rate,
        duration_samples: sample_count,
        duration_seconds: sample_count as f64 / f64::from(sample_rate),
        left_rms,
        right_rms,
        center_rms,
        side_rms,
        global_center_null_depth_db: db_ratio(center_rms, reference_rms, -300.0),
        deepest_null_sample,
        deepest_null_time_seconds: deepest_null_sample as f64 / f64::from(sample_rate),
        deepest_null_db_10ms,
        source_states,
    };

    Ok(RenderResult {
        left,
        right,
        physical_center,
        center,
        side,
        metrics,
    })
}

fn normalized_partials(source: &Source) -> Result<Vec<Partial>, RenderError> {
    if matches!(source.generator, Generator::Sine) {
        return Ok(Vec::new());
    }

    let partials = if source.partials.is_empty() {
        vec![Partial {
            harmonic: 1,
            amplitude: 1.0,
            phase_offset_deg: 0.0,
        }]
    } else {
        source.partials.clone()
    };

    for partial in &partials {
        if partial.harmonic == 0 {
            return Err(RenderError::InvalidPartial {
                source_id: source.id.clone(),
                harmonic: partial.harmonic,
            });
        }
    }

    let sum: f64 = partials.iter().map(|partial| partial.amplitude).sum();
    if sum == 0.0 {
        return Ok(partials);
    }

    Ok(partials
        .into_iter()
        .map(|partial| Partial {
            harmonic: partial.harmonic,
            amplitude: partial.amplitude / sum,
            phase_offset_deg: partial.phase_offset_deg,
        })
        .collect())
}

fn phase_at_sample(
    fallback: f64,
    track: Option<&AutomationTrack>,
    sample: usize,
) -> Result<f64, RenderError> {
    let Some(track) = track else {
        return Ok(fallback);
    };

    let mut keys = track.keys.clone();
    keys.sort_by_key(|key| key.sample);
    let first = keys.first().ok_or_else(|| RenderError::EmptyAutomation {
        target: track.target.clone(),
    })?;
    let last = keys.last().expect("non-empty after first check");

    if sample <= first.sample {
        return Ok(first.value);
    }
    if sample >= last.sample {
        return Ok(last.value);
    }

    let upper_index = keys.partition_point(|key| key.sample < sample);
    let lower = keys[upper_index - 1];
    let upper = keys[upper_index];

    if upper.sample == lower.sample {
        return Ok(upper.value);
    }

    let position = (sample - lower.sample) as f64 / (upper.sample - lower.sample) as f64;
    Ok(lower.value + position * (upper.value - lower.value))
}

fn centered_rms_curve(signal: &[f64], window: usize) -> Vec<f64> {
    let mut prefix = vec![0.0_f64; signal.len() + 1];
    for (index, value) in signal.iter().enumerate() {
        prefix[index + 1] = prefix[index] + value * value;
    }

    // Mirrors numpy.convolve(x, ones(window)/window, mode="same") for an even
    // window: the sample range is [i - window/2, i + window/2 - 1], with
    // zero-padding outside the signal and division by the full window length.
    let left_extent = window / 2;
    let right_extent = window - left_extent - 1;

    (0..signal.len())
        .map(|index| {
            let start = index.saturating_sub(left_extent);
            let end_inclusive = usize::min(signal.len() - 1, index + right_extent);
            let sum = prefix[end_inclusive + 1] - prefix[start];
            (sum / window as f64).sqrt()
        })
        .collect()
}

#[must_use]
pub fn rms(signal: &[f64]) -> f64 {
    if signal.is_empty() {
        return 0.0;
    }
    let mean_square = signal.iter().map(|value| value * value).sum::<f64>() / signal.len() as f64;
    mean_square.sqrt()
}

#[must_use]
pub fn db_ratio(numerator: f64, denominator: f64, floor_db: f64) -> f64 {
    if numerator <= 0.0 || denominator <= 0.0 {
        return floor_db;
    }
    floor_db.max(20.0 * (numerator / denominator).log10())
}

fn channel_name(channel: Channel) -> &'static str {
    match channel {
        Channel::Left => "L",
        Channel::Right => "R",
        Channel::Center => "C",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sine_source(id: &str, channel: Channel, phase_deg: f64) -> Source {
        Source {
            id: id.to_owned(),
            generator: Generator::Sine,
            frequency_hz: 440.0,
            amplitude: 1.0,
            phase_deg,
            partials: Vec::new(),
            channel,
        }
    }

    fn experiment(sources: Vec<Source>) -> Experiment {
        Experiment {
            experiment_id: "TEST".to_owned(),
            engine: Engine {
                sample_rate: 48_000,
                render_seed: 1,
            },
            timeline: Timeline {
                duration_samples: 4_800,
            },
            sources,
            automation: Vec::new(),
            visualization: serde_json::json!({"phase_angle_exaggeration": 1.0}),
        }
    }

    #[test]
    fn identical_left_and_right_have_zero_side() {
        let result = render(&experiment(vec![
            sine_source("L", Channel::Left, 0.0),
            sine_source("R", Channel::Right, 0.0),
        ]))
        .expect("render succeeds");

        assert!(result.side.iter().all(|value| value.abs() < 1.0e-12));
    }

    #[test]
    fn opposite_left_and_right_have_zero_center() {
        let result = render(&experiment(vec![
            sine_source("L", Channel::Left, 0.0),
            sine_source("R", Channel::Right, 180.0),
        ]))
        .expect("render succeeds");

        assert!(result.center.iter().all(|value| value.abs() < 1.0e-12));
    }

    #[test]
    fn visualization_metadata_cannot_change_audio() {
        let mut first = experiment(vec![sine_source("L", Channel::Left, 0.0)]);
        let first_result = render(&first).expect("render succeeds");

        first.visualization = serde_json::json!({
            "phase_angle_exaggeration": 100_000.0,
            "amplitude_scale": 999.0
        });
        let second_result = render(&first).expect("render succeeds");

        assert_eq!(first_result.left, second_result.left);
        assert_eq!(first_result.center, second_result.center);
    }

    #[test]
    fn linear_phase_automation_is_sample_addressed() {
        let mut test = experiment(vec![sine_source("R", Channel::Right, 0.0)]);
        test.timeline.duration_samples = 101;
        test.automation.push(AutomationTrack {
            target: "R.phase_deg".to_owned(),
            curve: Curve::Linear,
            keys: vec![
                AutomationKey {
                    sample: 0,
                    value: 0.0,
                },
                AutomationKey {
                    sample: 100,
                    value: 180.0,
                },
            ],
        });

        let result = render(&test).expect("render succeeds");
        let state = result.metrics.source_states.get("R").expect("state exists");
        assert_eq!(state.phase_deg_start, 0.0);
        assert_eq!(state.phase_deg_end, 180.0);
    }
}
