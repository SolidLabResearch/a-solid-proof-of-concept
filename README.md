# A-Solid Proof-of-Concept

This is an example setup of all the different components of the A-Solid project for proof-of-concept demonstration purposes, consisting of:

* [Reasoner](./reasoner/) used to process data based on the rules
* [Pods](./pods/) used to store all the data, with the template data for the demo already included
* [Orchestrators](./orchestrator/) used to generate data based on the rules and write it to the pods

### Set up demo

1. Prepare the pods, reasoner and orchestrator via `yarn setup:demo`.
2. Start the reasoner via `yarn start:reasoner`.
3. Start the pods via `yarn start:pods`.

### Show demo

1. Open https://solideditor.patrickhochstenbach.net/ to show http://localhost:3000/citizen/private.
2. Open https://solideditor.patrickhochstenbach.net/ to show http://localhost:3000/government/rules.
3. Open https://solideditor.patrickhochstenbach.net/ to show http://localhost:3000/citizen/benefits (initially empty).
4. Run Benefit calculation orchestrator in terminal via `yarn start:benefits-orchestrator`.
5. Open https://solideditor.patrickhochstenbach.net/ to show that benefit is added to http://localhost:3000/citizen/benefits.
6. Remove read access for orchestrator to http://localhost:3000/citizen/private via https://waceditor.patrickhochstenbach.net/.
7. Run Benefit calculation orchestrator again. You get an error now.
8. Add read access again for the orchestrator (http://localhost:3000/webid/benefit-calculation-orchestrator#me).
9. Run orchestrator again. It works again.
10. Open https://solideditor.patrickhochstenbach.net/ to change http://localhost:3000/citizen/private.
11. Run orchestrator again via `yarn start:benefits-orchestrator`.
12. Open https://solideditor.patrickhochstenbach.net/ to show that benefit is set to false in http://localhost:3000/citizen/benefits.
13. Open https://solideditor.patrickhochstenbach.net/ to change http://localhost:3000/citizen/private.
14. Run orchestrator again via `yarn start:benefits-orchestrator`.
15. Open https://solideditor.patrickhochstenbach.net/ to show the original invoice at http://localhost:3000/company/invoice.
16. Open https://solideditor.patrickhochstenbach.net/ to show the citizen's inbox at http://localhost:3000/citizen/inbox (initially empty).
17. Open https://solideditor.patrickhochstenbach.net/ to show the government's inbox at http://localhost:3000/government/inbox (initially empty).
Use a different browser.
18. Run Invoice calculation orchestrator in terminal via `yarn start:invoice-orchestrator`.
19. Open https://solideditor.patrickhochstenbach.net/ to show that notification is added to the citizen's inbox at http://localhost:3000/citizen/inbox.
20. Open https://solideditor.patrickhochstenbach.net/ to show details of invoice at http://localhost:3000/company/invoice-citizen#invoice.
21. Open https://solideditor.patrickhochstenbach.net/ to show that notification is added to the government's inbox at http://localhost:3000/government/inbox.
22. Open https://solideditor.patrickhochstenbach.net/ to show details of invoice at http://localhost:3000/company/invoice-government#invoice.
23. Reset invoices via `yarn reset:invoices`.
24. Open https://solideditor.patrickhochstenbach.net/ to change `:getsIncomeGuaranteeForElderly` to `false` in http://localhost:3000/citizen/private.
25. Run Benefit calculation orchestrator in terminal via `yarn start:benefits-orchestrator`.
26. Run Invoice calculation orchestrator in terminal via `yarn start:invoice-orchestrator`.
27. Open https://solideditor.patrickhochstenbach.net/ to show details of invoice at http://localhost:3000/company/invoice-citizen#invoice (full price now).
28. Reset invoices via `yarn reset:invoices`.
29. Remove read access for the Invoice calculation orchestrator to http://localhost:3000/citizen/benefits via https://waceditor.patrickhochstenbach.net/.
30. Run Invoice calculation orchestrator again via `yarn start:invoice-orchestrator`.
31. Open https://solideditor.patrickhochstenbach.net/ to show details of invoice at http://localhost:3000/company/invoice-citizen#invoice (full price again).
