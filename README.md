# Account link page demo

Responsive, data-driven link-in-bio demo with ten separate profile pages.

## Preview locally

From this directory, run `python -m http.server 8765` and open `http://localhost:8765/`.

## Structure

- `index.html`: mobile-friendly page shell and shared header/footer.
- `style.css`: responsive directory and profile page designs.
- `data.json`: editable source for all ten profiles, buttons, post bundles, and product links.
- `app.js`: renders the directory and hash-based profile routes.

Routes look like `#/a/photo-gear`; copy each profile URL with its page button. Every profile page has the same number search field: standard profiles search numbered links, while the 20s women's profile searches product numbers inside post bundles. Update `data.json` to change profile details, colors, and links. Most profiles use a `links` array. The 20s women's profile uses `posts[]`, with a numbered, collapsible post title and a nested `products[]` list; each product has its own number, title, description, and URL. Buttons without a URL are disabled demo destinations. Never put passwords, API keys, or other secrets in this public data file.

## Agent handoff

The `20woman-insta` agent writes a job folder containing `publish_payload.json`, the three review files, `products.json`, and `pages.json`. Import a job only after all three review files say `PASS` and the payload is `DRY_RUN_READY` with `publish_ready: true`:

```powershell
cd ..
python scripts/import_link_hub.py --job data/jobs/<job-folder>
python scripts/import_link_hub.py --job data/jobs/<job-folder> --apply
```

The first command previews the import. The second appends one five-product post to the `women-20s` account in `site/data.json`; rerunning it for the same job is safe. Product numbers continue across posts, so the shared number search can find each item. The importer uses reviewed card copy and verified Coupang affiliate URLs. It never publishes to Instagram.

## Live hosting and publishing

The public site is deployed at https://ehdudssal3-hub.github.io/insta-link-hub/. GitHub Actions redeploys it whenever a commit reaches `main`. The repository is public for GitHub Free Pages, and currently has no collaborators; visitors can read the source, but only the owner account can write to it.

After signing in to GitHub once on the machine that runs the agent (`git credential-manager github login --browser`), the agent uses this command from the project root:

```powershell
cd ..
python scripts/publish_link_hub.py --job data/jobs/<job-folder>
```

That command checks the review gate, imports the job, commits only `site/data.json`, and pushes to `main`. The workflow in `.github/workflows/pages.yml` then deploys the static site. The site folder is isolated from the surrounding agent project to prevent other workspace files from being published. Site source and product links are public, so do not put credentials or private data in them.
