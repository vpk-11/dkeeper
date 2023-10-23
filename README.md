# dkeeper

DKeeper is a project built using React and Motoko on DFinity's ICP blockchain. It is a note-taking application, built in a similar styling to Google Keep. Users can create, and delete notes. DKeeper leverages the security and decentralized nature of the ICP blockchain to ensure that user data is safe.

## Tech Stack
React, DFINITY's ICP, Motoko

## Getting Started
to get started with the project, execute each line of code given below in a separate terminal
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