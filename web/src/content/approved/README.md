Questions approved by an expert through the content pipeline
(`server/tools/content_pipeline.py approve`). Every `*.json` file here is an
array of multiple-choice items; only items with `meta.reviewed: true` load
into the app. They join their domain's pool (boss fights, mock exams, review,
targeted practice). Do not edit by hand without re-running `npm test`.
