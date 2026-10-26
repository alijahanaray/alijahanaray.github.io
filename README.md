# Nevada Forward Data Repository

UNLV-branded static catalog of program datasets (metadata only).

## FERPA: read first

- **Do not commit student-level or PII data to this repo.** Keep it to metadata, aggregates, and documentation.
- **GitHub Pages is public by default**, even from a private repo. Obscure URLs and client-side passwords are *not* adequate protection under FERPA.
- Only publish this site if one of these is true:
  1. Your org is on **GitHub Enterprise Cloud** and Pages visibility is set to **Private** (access limited to org members).
  2. It is hosted behind **UNLV SSO / access control** (ask UNLV IT).
- Confirm with UNLV's FERPA/data governance office before storing any real data.

## Deploy (Enterprise Cloud private Pages)

1. Create a **private** repo in your org; upload `index.html` and `README.md`.
2. Settings → Pages → Source: *Deploy from branch* (`main`, `/root`).
3. Settings → Pages → **Visibility: Private**.
4. Edit the `DATASETS` array in `index.html` to list real datasets (metadata only).

## Edit datasets

Each entry: `title, description, category, years, format, access, steward, updated, link`.
Set `access: "Restricted"` for sensitive data, and point `link` to an approved secure system, not a file in this repo.
