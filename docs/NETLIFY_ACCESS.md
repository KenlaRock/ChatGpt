# Netlify access details

## Site
- https://av-stb.netlify.app/

## Build hooks
- Primary hook URL is managed as the `NETLIFY_BUILD_HOOK_PRIMARY` secret.
- Secondary hook URL is managed as the `NETLIFY_BUILD_HOOK_SECONDARY` secret.

## Preview server hook
- Preview hook URL is managed as the `NETLIFY_PREVIEW_SERVER_HOOK` secret.

Trigger commands (with env vars set):

```bash
npm run netlify:build:primary
npm run netlify:build:secondary
npm run netlify:preview:start
```

Example local setup (never commit real tokenized URLs):

```bash
export NETLIFY_BUILD_HOOK_PRIMARY='https://api.netlify.com/build_hooks/<primary-token>'
export NETLIFY_BUILD_HOOK_SECONDARY='https://api.netlify.com/build_hooks/<secondary-token>'
export NETLIFY_PREVIEW_SERVER_HOOK='https://api.netlify.com/preview_server_hooks/<preview-token>'
```

## Secret rotation note
If hook URLs were previously committed to git history or shared in docs/comments, rotate all impacted hooks in Netlify and replace them in your secret manager.

## SSH public key

```text
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCfUeZNgrJ693InDXsU5VW0yXgAviVtfZOB8fg3P77K9ch4Gl/Eegmfn0kyxVewAeNA0UtOakvm0BrWHVAoEcyuX3T+eN35fBh2QvNhPhw2RUCBOQom5BsE39bk9gnLaxKFLo5SmAunTsgPbdwCkXTwIP9vT0rypm65JXHMOK9AIoeRBtbpP88TSuWCZyNnCMeD8myuSPI+J+gkAUMx0gXE1Mm7Am8fokzOI8N6DlUHkt1a2UoTjpoBby83RqiF4U4O0pj1wiyJnoHaqgkUeQZ7Zmdhi0EclMgyEarPcGlx0MOPLbCC+t4EfzbHrObVPpntyT2Eq6IT7JjNko8tsRLwkX5tY5G0BD66Dnxy2qOxqs39lRsD7BWTSBWfhE+Tzvy+Tp2TJpvW+qamFH7VbihmCXnGItTZ6lxrgaRaUbGM4KmiI6QTm6wAe6llUnvM8Fgg8B2d8AeNXd7kwp/6v/1pMH5zpL3QIFdVgDyUQVJ9a6nIcMUiu0BV5adU0o7LaQW/fH28soUY6dFZnaGVbVoWizVhbdv54FLwgPnLYNSZKpoHEqT1Es9vN3cVb2h8fH319wvIx7ywiwVlk7OzsE6cuRjDPrkFUAl7jz62BSTKEJ2KwZ/7v1z6xDvZxK3C5ptNGd0XZkWAPU8mO3257zD3yfojefwfJDI9I8jvs+V0rQ==
```
