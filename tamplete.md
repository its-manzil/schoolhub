Create a complete Templates section at:

/app/Administrative/templates

STRICT RULES:

* Do NOT modify any existing files outside this folder
* Do NOT use dummy data
* Do NOT use localStorage
* Fetch all data from backend APIs
* Use logged-in schoolId from token

FRONTEND REQUIREMENTS:

* Create page.tsx as main page
* Create components folder inside templates
* Components:

  * TemplateForm (create/edit)
  * TemplateList (table/grid view)
  * TemplateModal (for editing)

FEATURES:

* Fetch templates from GET /api/templates
* Create template via POST /api/templates
* Update via PUT /api/templates/:id
* Delete via DELETE /api/templates/:id
* Show loading skeleton (no plain "Loading..." text)
* Handle empty state properly

BACKEND REQUIREMENTS:
* write its backend code inside: /server/pages/Administrative/tamplates.js
* Create route file: /server/routes/templates.js
* Use MongoDB
* Filter all data by schoolId (from token)
* Fields:

  * name
  * category
  * content
  * thumbnailUrl
* Add createdAt and updatedAt

IMPORTANT:

* Keep code modular and reusable
* Do NOT hardcode any data
* Do NOT break other modules
* Follow same auth middleware used in other routes

UI:

* Clean modern UI like your other admin pages
* Use cards and table layout
