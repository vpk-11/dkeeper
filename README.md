# dkeeper

A google Keep style short form notes app

to get started do the following
```
npm install
dfx start
dfx deploy
npm start
```

## Error
Sometimes we get an error that dkeeper_backend.did.js is missing
File keeps getting replaced with other junk files in the declarations folder
### Hacky fix
After npm start, run dfx deploy again in a new terminal, error seems to be mitigated temporarily
#### Need to find proper fix for this in future