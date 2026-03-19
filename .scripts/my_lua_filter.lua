-- https://pandoc.org/lua-filters.html
--
-- Reads `description` and `modified` from the document's YAML frontmatter
-- and populates `subtitle` and `date` for use in the pandoc LaTeX template.
--
-- Expected frontmatter:
--   description: "A short description of the document"
--   modified: 2026-03-19

local MONTHS = {
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
}

local BASE_URL        = "https://huami.ng/"
local GITHUB_REPO_URL = "https://github.com/huaminghuangtw/Evergreen-Lists/blob/main"

local function slugify(str)
  -- Normalize to lowercase
  str = str:lower()
  -- Replace any run of non-alphanumeric characters with a hyphen
  str = str:gsub("[^%a%d]+", "-")
  -- Strip leading/trailing hyphens
  str = str:match("^%-*(.-)%-*$")
  return str
end

local function formatIsoDate(iso)
  local y, m, d = iso:match("(%d%d%d%d)-(%d%d)-(%d%d)")
  if not y then return iso end
  return MONTHS[tonumber(m)] .. " " .. tonumber(d) .. ", " .. y
end

function Meta(meta)
  local slug = slugify(pandoc.utils.stringify(meta.title))

  -- description → subtitle
  if meta.description and not meta.subtitle then
    local url   = BASE_URL .. slug
    local desc  = pandoc.utils.stringify(meta.description)
    local latex = string.format("\\href{%s}{%s}", url, desc)
    meta.subtitle = pandoc.MetaInlines({ pandoc.RawInline("latex", latex) })
  end

  -- author
  if not meta.author then
    local authorLatex = string.format("\\href{%s}{Hua-Ming Huang}", BASE_URL)
    meta.author = pandoc.MetaInlines({ pandoc.RawInline("latex", authorLatex) })
  end

  -- modified → date
  if meta.modified and not meta.date then
    local iso       = pandoc.utils.stringify(meta.modified)
    local formatted = formatIsoDate(iso)
    local url       = string.format("%s/%s/%s.md", GITHUB_REPO_URL, slug, slug)
    local latex     = string.format("\\href{%s}{Last modified: %s}", url, formatted)
    meta.date       = pandoc.MetaInlines({ pandoc.RawInline("latex", latex) })
  end

  return meta
end
