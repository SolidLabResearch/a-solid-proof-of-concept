# A-Solid Orchestrator

This is the orchestrator setup for the A-Solid project, that allows running tasks following a simple pattern:

1. Read data from a source
2. Read rules from a source
3. Send the data and rules to a reasoner
4. Perform tasks based on the output of the reasoner

Currently, the following tasks have been implemented:

* Update social tariff eligibility for a citizen
* Generate invoice for a citizen, based on social tariff eligibility

## Usage

The orchestrator relies on the following services being available:

* Solid pods with registered users and template data, from `../pods`
* EYE reasoner from `../reasoner`

Installing dependencies and preparing configurations:

1. Install dependencies via `yarn install --frozen-lockfile`
2. Build via `yarn run build`

Running the orchestrator:

* To update social tariff eligibility: `yarn run orchestrator:benefits`
* To generate invoices: `yarn run orchestrator:invoices`

The log level can be changed to debug via `--debug` and help can be displayed through `--help`.
