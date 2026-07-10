use std::env;
use std::fs;
use std::path::PathBuf;

use nf_sim_core::{render, Experiment};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut args = env::args_os().skip(1);
    let experiment_path = args
        .next()
        .map(PathBuf::from)
        .ok_or("usage: nf-sim-core <experiment.json> [metrics.json]")?;
    let output_path = args.next().map(PathBuf::from);

    if args.next().is_some() {
        return Err("usage: nf-sim-core <experiment.json> [metrics.json]".into());
    }

    let source = fs::read_to_string(&experiment_path)?;
    let experiment: Experiment = serde_json::from_str(&source)?;
    let result = render(&experiment)?;
    let json = serde_json::to_string_pretty(&result.metrics)? + "\n";

    if let Some(path) = output_path {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::write(path, &json)?;
    }

    print!("{json}");
    Ok(())
}
