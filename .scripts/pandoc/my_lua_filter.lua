-- https://pandoc.org/lua-filters.html
--
-- Turns the document's YAML frontmatter into a cover page:
--   title
--   description
--   modified

local MONTHS = {
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
}

local BASE_URL = "https://huam.ing/"

local function listSlug()
  local state = PANDOC_STATE or pandoc.state
  local path = state and state.input_files and state.input_files[1]
  return path and path:match("([^/\\]+)%.md$")
end

local function formatIsoDate(iso)
  local y, m, d = iso:match("(%d%d%d%d)-(%d%d)-(%d%d)")
  if not y then return iso end
  return MONTHS[tonumber(m)] .. " " .. tonumber(d) .. ", " .. y
end

function Meta(meta)
  local slug = listSlug()

  -- title
  if slug and meta.title then
    local url   = BASE_URL .. slug
    local title = pandoc.Inlines(pandoc.utils.stringify(meta.title))
    meta.title  = pandoc.MetaInlines({ pandoc.Link(title, url) })
  end

  -- description → subtitle
  if meta.description and not meta.subtitle then
    meta.subtitle =
      pandoc.MetaString(pandoc.utils.stringify(meta.description))
  end

  -- author
  if not meta.author then
    local authorLatex = string.format("\\href{%s}{Hua-Ming Huang}", BASE_URL)
    meta.author = pandoc.MetaInlines({ pandoc.RawInline("latex", authorLatex) })
  end

  -- modified → date
  if meta.modified and not meta.date then
    local iso = pandoc.utils.stringify(meta.modified)
    meta.date = pandoc.MetaString("Last modified: " .. formatIsoDate(iso))
  end

  return meta
end
