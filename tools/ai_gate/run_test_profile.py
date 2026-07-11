#!/usr/bin/env python3
"""Run fixed NullForge AI Gate test profiles without invoking a shell."""
from __future__ import annotations
import argparse, json, subprocess, time, tempfile, os
from pathlib import Path


def run(cmd):
    env=os.environ.copy()
    env["PYTHONDONTWRITEBYTECODE"]="1"
    p=subprocess.run(cmd,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=False,env=env)
    return p

def git(*args):
    p=run(["git",*args])
    if p.returncode: raise SystemExit(p.stderr)
    return p.stdout.strip()

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--proof',required=True); ap.add_argument('--config',required=True)
    ap.add_argument('--base',required=True); ap.add_argument('--head',default='HEAD'); ap.add_argument('--output',required=True)
    a=ap.parse_args(); proof=json.loads(Path(a.proof).read_text()); config=json.loads(Path(a.config).read_text())
    merge_base=git('merge-base',a.base,a.head); head=git('rev-parse',a.head)
    ids=config['test_profiles'][proof['risk_class']]
    if proof['required_test_ids'] != ids: raise SystemExit('Test profile mismatch')
    results=[]
    initial_status=git('status','--porcelain=v1','--untracked-files=all')
    output_root=Path(tempfile.mkdtemp(prefix='nullforge-gate-tests-'))
    for test_id in ids:
        spec=config['tests'][test_id]
        missing=[p for p in spec.get('required_paths',[]) if not Path(p).exists()]
        if missing:
            results.append({'id':test_id,'argv':spec['argv'],'returncode':127,'skipped':True,'missing_paths':missing,'duration_seconds':0})
            continue
        argv=[arg.replace('{test_output_dir}',str(output_root)) for arg in spec['argv']]
        start=time.monotonic(); p=run(argv); duration=round(time.monotonic()-start,3)
        results.append({'id':test_id,'argv':argv,'returncode':p.returncode,'skipped':False,'duration_seconds':duration,'stdout_tail':p.stdout[-4000:],'stderr_tail':p.stderr[-4000:]})
    final_status=git('status','--porcelain=v1','--untracked-files=all')
    dirty_changed = final_status != initial_status
    evidence={'schema_version':'0.2.1','base_commit':merge_base,'head_commit':head,'risk_class':proof['risk_class'],'test_ids':ids,'results':results,'working_tree_changed_by_tests':dirty_changed}
    Path(a.output).write_text(json.dumps(evidence,indent=2)+'\n')
    failed=[r for r in results if r['returncode'] or r['skipped']]
    if dirty_changed: failed.append({'id':'working_tree_cleanliness'})
    if failed: raise SystemExit('One or more required tests failed or were unavailable')
    print('AI_GATE_TESTS_PASS: '+', '.join(ids))
if __name__=='__main__': main()
