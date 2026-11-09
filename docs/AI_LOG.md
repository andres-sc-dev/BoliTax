# Bitacora de uso de IA — BoliTax

Herramientas usadas:
- Claude (chat en claude.ai): planeacion, explicaciones y revision de prompts.
- Claude Code (agente en VSCode): generacion de codigo.

---

### Entrada #1
- Fecha: 2026-11-06
- Integrante: Andrés Salazar Castrillón
- Herramienta: Claude (chat)
- Objetivo: Planear el proyecto y definir la metodologia de trabajo con un agente de IA
- Prompt: "tengo este taller para desarrollo movil, nos permitieron IA generativa por ende quiero que esto sea un inicio formativo a como desarrollar con IA, como saber guiar a la IA correctamente, no simplemente copie y pegue sino conectarlo con el agente de VSCode. tu me vas a orientar en como orientar correctamente al agente, que no sea simplemente copy page. ojo, ya no esta dividido el proyecto en 2 sino que ya toca hacerlo completo. el proyecto se llama bolitax, es lo unico que modificaremos del documento, el nombre del proyecto. adicional al documento quiero meterle un plus que es que un taxi se mueva hasta debajo del logo bolitax (despues lo crearemos) en el inicio al abrir la app, sonido al salir el servicio, osea, cuando salga un servicio debe de sonar y tambien la funcionalidad que pide el documento y ya, por ahora eso seria todo. despues cuando lleguemos a la parte de diseño del front hablamos que tipo de diseño quiero. por ahora iniciemos. ahh tambien necesito que me guies en todo lo relacionado con conexiones de apis y de bd y todo en general. que mas necesitas saber para que iniciemos?"
- Resumen de la respuesta: Se definio el flujo de trabajo con el agente (contexto fijo, plan antes de codigo, tareas pequeñas, revision del diff, verificacion, commit y bitacora) y se identifico la informacion necesaria para iniciar.
- Que se uso / modifico / descarto: Se uso la metodologia propuesta. Se descarto la integracion de Claude via Copilot y se uso la extension oficial Claude Code.
- Archivos y commit: CLAUDE.md, AGENTS.md — 4f73d04 (HEAD -> main, origin/main, origin/HEAD) Merge pull request #1 from andres-sc-dev/setup/agent-context 39e506a (origin/setup/agent-context, setup/agent-context) docs: Se agrega CLAUDE.md,se ajusta AGENTS.md y requisitos del proyecto e8b6a37 feat: agrega funcion calculateFare con comision y ganancia neta
- Verificacion: Revision manual del CLAUDE.md antes del commit; PR #1 revisado y mergeado.
- Aprendizaje: se comprendio que no solo es poner un buen prompt sino tambien saber configurarlo desde los archivos.

