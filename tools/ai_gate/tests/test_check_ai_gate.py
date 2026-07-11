from __future__ import annotations
import hashlib, json, os, shutil, subprocess, sys, tempfile, unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

PACKAGE=Path(__file__).resolve().parents[3]
VALIDATOR=PACKAGE/'tools/ai_gate/check_ai_gate.py'
SCHEMA=PACKAGE/'schemas/ai-session-proof.schema.json'
CONFIG=PACKAGE/'docs/governance/AI_GATE_CONFIG.json'


def proc(cmd,cwd,check=True):
    p=subprocess.run(cmd,cwd=cwd,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if check and p.returncode: raise RuntimeError(p.stderr)
    return p

def sha(data): return 'sha256:'+hashlib.sha256(data).hexdigest()

class GateTests(unittest.TestCase):
    def setUp(self):
        self.root=Path(tempfile.mkdtemp(prefix='nf_gate_v02_'))
        proc(['git','init','-b','main'],self.root); proc(['git','config','user.email','qa@example.invalid'],self.root); proc(['git','config','user.name','QA'],self.root)
        shutil.copytree(PACKAGE,self.root,dirs_exist_ok=True)
        base_files={
          'README.md':'# NullForge\nPublic reproducible signal lab.\n','ARCHITECTURE.md':'# Architecture\nTruth is separate from visualization.\n',
          'SCIENTIFIC_INTEGRITY.md':'# Integrity\nPolicy is not evidence.\n','PUBLICATION_BOUNDARY.md':'# Boundary\nNo private links.\n',
          'CHANGELOG.md':'# Changelog\n','docs/STATE.md':'# State\nGREEN\n','src/app.py':'print("base")\n',
          'tools/check_public_boundary.py':'print("boundary ok")\n',          'tests/test_smoke.py':'import unittest\nclass T(unittest.TestCase):\n def test_ok(self): self.assertTrue(True)\n',
          'reference/run_experiment.py':'print("reference ok")\n','scenarios/phase-and-null/EXP-VECTOR-NULL-001.json':'{}\n',
        }
        for rel,text in base_files.items():
            p=self.root/rel; p.parent.mkdir(parents=True,exist_ok=True); p.write_text(text)
        proc(['git','add','.'],self.root); proc(['git','commit','-m','base'],self.root)
        self.base=proc(['git','rev-parse','HEAD'],self.root).stdout.strip(); proc(['git','checkout','-b','task/test'],self.root)

    def tearDown(self): shutil.rmtree(self.root,ignore_errors=True)

    def base_hash(self,path): return sha(proc(['git','show',f'{self.base}:{path}'],self.root).stdout.encode())

    def proof(self,**kw):
        cfg=json.loads((self.root/'docs/governance/AI_GATE_CONFIG.json').read_text())
        mandatory=cfg['mandatory_read_files']
        risk=kw.pop('risk_class','R2_LOGIC')
        data={
          'schema_version':'0.2.1','task_id':'TASK-123','branch':'task/test','base_commit':self.base,
          'agent':{'name':'Test Agent','model_or_runtime':'unit-test','operator':'Ken'},
          'created_at':datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z'),
          'mandatory_files':mandatory,'mandatory_file_hashes':{p:self.base_hash(p) for p in mandatory},
          'project_state_summary':'NullForge is a public reproducible signal laboratory with strict truth, visualization, evidence and publication boundaries. This fixture represents the protected green base.',
          'current_task_summary':'Modify one approved implementation file, update state records, and verify the hardened AI gate under adversarial unit tests.',
          'must_not_change':['scientific evidence semantics','private workspace boundary'],
          'latest_green_version':'main@'+self.base,'allowed_paths':['src/**'],'additional_forbidden_paths':[],
          'approved_context_changes':[],
          'risk_class':risk,'required_test_ids':cfg['test_profiles'][risk],
          'rollback_plan':'Revert the task commit, reset the branch to the recorded merge-base, and preserve the failed gate output as QA evidence for review.',
          'control_report_path':'ai/control-report.md','gate_change':False,
        }
        data.update(kw); (self.root/'ai/session-proof.json').write_text(json.dumps(data,indent=2)); return data

    def report(self,proof,placeholder=False):
        body='Replace this paragraph' if placeholder else ('Substantive technical explanation tied to the task and repository constraints. '*2)
        text=f'''# AI Gate Control Report\n\nTask ID: `{proof["task_id"]}`\nBranch: `{proof["branch"]}`\nBase commit: `{proof["base_commit"]}`\n\n'''
        for h in ['Project purpose','Current task','Mandatory files read','What absolutely must not be changed','Latest stable / green version','Approved scope','Risk class','Required tests','Rollback plan']:
            text+=f'## {h}\n\n{body}\n\n'
        (self.root/'ai/control-report.md').write_text(text)

    def normal_changes(self):
        (self.root/'src/app.py').write_text('print("changed")\n'); (self.root/'CHANGELOG.md').write_text('# Changelog\n- changed\n'); (self.root/'docs/STATE.md').write_text('# State\nchanged\n')

    def commit(self): proc(['git','add','-A'],self.root); proc(['git','commit','-m','task'],self.root)

    def evidence(self,proof,success=True):
        head=proc(['git','rev-parse','HEAD'],self.root).stdout.strip(); ids=proof['required_test_ids']
        e={'schema_version':'0.2.1','base_commit':self.base,'head_commit':head,'risk_class':proof['risk_class'],'test_ids':ids,'results':[{'id':x,'returncode':0 if success else 1,'skipped':False} for x in ids],'working_tree_changed_by_tests':False}
        p=self.root/'evidence.json'; p.write_text(json.dumps(e)); return p

    def gate(self,proof,phase='preflight',evidence=None):
        cmd=[sys.executable,str(VALIDATOR),'--phase',phase,'--proof','ai/session-proof.json','--control-report','ai/control-report.md','--schema',str(SCHEMA),'--config',str(CONFIG),'--base',self.base,'--head','HEAD','--branch','task/test']
        if evidence: cmd += ['--test-evidence',str(evidence)]
        return proc(cmd,self.root,check=False)

    def prepared(self,**proof_kw):
        self.normal_changes(); proof=self.proof(**proof_kw); self.report(proof); self.commit(); return proof

    def test_happy_r2_preflight_and_final(self):
        p=self.prepared(); self.assertEqual(self.gate(p).returncode,0); self.assertEqual(self.gate(p,'final',self.evidence(p)).returncode,0)
    def test_empty_hashes_fail(self):
        p=self.prepared(mandatory_file_hashes={}); self.assertNotEqual(self.gate(p).returncode,0)
    def test_placeholder_report_fail(self):
        self.normal_changes(); p=self.proof(); self.report(p,True); self.commit(); self.assertNotEqual(self.gate(p).returncode,0)
    def test_branch_mismatch_fail(self):
        p=self.prepared(branch='task/other'); self.assertNotEqual(self.gate(p).returncode,0)
    def test_base_mismatch_fail(self):
        p=self.prepared(base_commit='d'*40); self.assertNotEqual(self.gate(p).returncode,0)
    def test_dummy_mandatory_list_fail(self):
        p=self.prepared(mandatory_files=['README.md'],mandatory_file_hashes={'README.md':self.base_hash('README.md')}); self.assertNotEqual(self.gate(p).returncode,0)
    def test_regenerated_hash_after_context_edit_fail(self):
        self.normal_changes(); (self.root/'ARCHITECTURE.md').write_text('# changed\n'); p=self.proof(); p['mandatory_file_hashes']['ARCHITECTURE.md']=sha((self.root/'ARCHITECTURE.md').read_bytes()); (self.root/'ai/session-proof.json').write_text(json.dumps(p)); self.report(p); self.commit(); self.assertNotEqual(self.gate(p).returncode,0)
    def test_nested_env_fail(self):
        self.normal_changes(); q=self.root/'src/sub/.env'; q.parent.mkdir(parents=True); q.write_text('SECRET=fake\n'); p=self.proof(); self.report(p); self.commit(); self.assertNotEqual(self.gate(p).returncode,0)
    def test_root_wildcard_fail(self):
        p=self.prepared(allowed_paths=['**']); self.assertNotEqual(self.gate(p).returncode,0)
    def test_protected_rename_checks_old_path(self):
        self.normal_changes(); os.rename(self.root/'docs/governance/GITHUB_RULESET_SETUP.md',self.root/'src/MOVED.md'); p=self.proof(risk_class='R4_GOVERNANCE_OR_DEPLOY',gate_change=True); self.report(p); self.commit(); self.assertNotEqual(self.gate(p).returncode,0)
    def test_test_profile_mismatch_fail(self):
        p=self.prepared(required_test_ids=['unit_tests']); self.assertNotEqual(self.gate(p).returncode,0)
    def test_final_requires_evidence(self):
        p=self.prepared(); self.assertNotEqual(self.gate(p,'final').returncode,0)
    def test_failed_test_evidence_fail(self):
        p=self.prepared(); self.assertNotEqual(self.gate(p,'final',self.evidence(p,False)).returncode,0)
    def test_non_substantive_state_update_fail(self):
        (self.root/'src/app.py').write_text('print("changed")\n'); (self.root/'CHANGELOG.md').write_text('# Changelog\n   \n'); (self.root/'docs/STATE.md').write_text('# State\nGREEN\n   \n'); p=self.proof(); self.report(p); self.commit(); self.assertNotEqual(self.gate(p).returncode,0)
    def test_gate_change_r4_with_flag_passes_preflight(self):
        self.normal_changes(); (self.root/'tools/ai_gate/run_test_profile.py').write_text('# changed gate runner\n')
        p=self.proof(risk_class='R4_GOVERNANCE_OR_DEPLOY',allowed_paths=['src/**','tools/ai_gate/**'],gate_change=True)
        self.report(p); self.commit(); self.assertEqual(self.gate(p).returncode,0)
    def test_gate_change_requires_flag(self):
        self.normal_changes(); (self.root/'tools/ai_gate/run_test_profile.py').write_text('# changed\n'); p=self.proof(risk_class='R4_GOVERNANCE_OR_DEPLOY',allowed_paths=['tools/ai_gate/**']); self.report(p); self.commit(); self.assertNotEqual(self.gate(p).returncode,0)

    def test_immutable_context_change_requires_explicit_approval(self):
        self.normal_changes(); (self.root/'ARCHITECTURE.md').write_text('# Architecture\nApproved R4 change.\n')
        p=self.proof(risk_class='R4_GOVERNANCE_OR_DEPLOY',allowed_paths=['src/**','ARCHITECTURE.md'],gate_change=True)
        self.report(p); self.commit(); self.assertNotEqual(self.gate(p).returncode,0)

    def test_immutable_context_change_with_explicit_approval_passes(self):
        self.normal_changes(); (self.root/'ARCHITECTURE.md').write_text('# Architecture\nApproved R4 change.\n')
        p=self.proof(risk_class='R4_GOVERNANCE_OR_DEPLOY',allowed_paths=['src/**','ARCHITECTURE.md'],gate_change=True,approved_context_changes=['ARCHITECTURE.md'])
        self.report(p); self.commit(); self.assertEqual(self.gate(p).returncode,0)

    def test_approved_context_change_must_actually_change(self):
        p=self.prepared(risk_class='R4_GOVERNANCE_OR_DEPLOY',gate_change=True,approved_context_changes=['ARCHITECTURE.md'])
        self.assertNotEqual(self.gate(p).returncode,0)

    def test_small_future_clock_skew_is_accepted(self):
        created=(datetime.now(timezone.utc)+timedelta(minutes=2)).replace(microsecond=0).isoformat().replace('+00:00','Z')
        p=self.prepared(created_at=created)
        self.assertEqual(self.gate(p).returncode,0)

    def test_large_future_clock_skew_is_rejected(self):
        created=(datetime.now(timezone.utc)+timedelta(minutes=10)).replace(microsecond=0).isoformat().replace('+00:00','Z')
        p=self.prepared(created_at=created)
        self.assertNotEqual(self.gate(p).returncode,0)

if __name__=='__main__': unittest.main()
