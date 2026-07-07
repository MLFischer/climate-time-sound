# export_data.R — one-time data preparation for the Climate Music Web app.
# Reads the prepared data of the R project (climate-music-project) and
# downloads a curated set of Berkeley Earth city records, then writes
# compact JSON files into ../data. The web app itself is fully static:
# this script is the only place where R is still used.
#
# Run from anywhere:  Rscript tools/export_data.R

suppressMessages(library(jsonlite))

args_dir <- normalizePath(file.path(dirname(sub("--file=", "", grep("--file=", commandArgs(FALSE), value = TRUE)[1])), ".."))
web_dir  <- args_dir
r_proj   <- normalizePath(file.path(web_dir, "..", "climate-music-project"))
out_dir  <- file.path(web_dir, "data")
dir.create(file.path(out_dir, "cities"), showWarnings = FALSE, recursive = TRUE)

rnd <- function(x, d = 3) ifelse(is.finite(x), round(x, d), NA)

## ---------------------------------------------------------------- global ----
load(file.path(r_proj, "data", "Gavg.RData"))
load(file.path(r_proj, "data", "NH.RData"))
load(file.path(r_proj, "data", "SH.RData"))

key <- function(df) df$year * 12 + df$month
g <- Gavg[Gavg$year >= 1880 & Gavg$year <= 2019, ]
g <- g[order(g$year, g$month), ]
nh <- NH[match(key(g), key(NH)), ]
sh <- SH[match(key(g), key(SH)), ]

global <- list(
  source = "HadCRUT 4.6.0.0 (Met Office Hadley Centre / CRU)",
  first_year = min(g$year), last_year = max(g$year),
  year = g$year, month = g$month,
  anomaly = rnd(g$anomaly),
  nh_abs = rnd(nh$TMPabs), sh_abs = rnd(sh$TMPabs)
)
write_json(global, file.path(out_dir, "global.json"), auto_unbox = TRUE, na = "null", digits = NA)
cat("global.json:", nrow(g), "months\n")

## ----------------------------------------------------------------- paleo ----
paleo_src <- file.path(r_proj, "data", "paleo")
paleo_defs <- list(
  list(id="lr04",        file="lr04.csv",         col="d18o", unit="‰"),
  list(id="epica_co2",   file="co2.csv",          col="co2",  unit="ppm"),
  list(id="epica_temp",  file="temp.csv",         col="temp", unit="°C"),
  list(id="vostok_co2",  file="vostok_co2.csv",   col="co2",  unit="ppm"),
  list(id="vostok_temp", file="vostok_temp.csv",  col="temp", unit="°C"),
  list(id="chew_k",      file="chew_bahir.csv",   col="k",    unit="counts"),
  list(id="bosumtwi",    file="bosumtwi.csv",     col="k",    unit="counts"),
  list(id="geob1016_sst",file="geob1016_sst.csv", col="sst",  unit="°C"),
  list(id="enso_pc1",    file="enso_pc1.csv",     col="pc1",  unit="PC1"),
  list(id="ngrip",       file="ngrip.csv",        col="d18o", unit="‰"),
  list(id="sanbao",      file="sanbao.csv",       col="d18o", unit="‰"),
  list(id="geob1028_nam",file="geob1028_nam.csv", col="nam",  unit="NAM1"),
  list(id="kl15_cati",   file="kl15_cati.csv",    col="cati", unit="Ca/Ti"),
  list(id="odp967_tial", file="odp967_tial.csv",  col="tial", unit="Ti/Al"),
  list(id="ohrid_k",     file="ohrid_k.csv",      col="k",    unit="counts"),
  list(id="ecc",         file="orbital.csv",      col="ecc",  unit=""),
  list(id="obl",         file="orbital.csv",      col="obl",  unit="°"),
  list(id="prec",        file="orbital.csv",      col="prec", unit="")
)
paleo <- list()
for (d in paleo_defs) {
  df <- read.csv(file.path(paleo_src, d$file))
  df <- df[is.finite(df$age_kyr) & is.finite(df[[d$col]]), ]
  df <- df[order(df$age_kyr), ]
  paleo[[d$id]] <- list(unit = d$unit,
                        age = rnd(df$age_kyr, 2), value = rnd(df[[d$col]], 4))
  cat(sprintf("paleo %-13s %5d points, %.0f-%.0f kyr\n", d$id, nrow(df), min(df$age_kyr), max(df$age_kyr)))
}
write_json(paleo, file.path(out_dir, "paleo.json"), auto_unbox = TRUE, na = "null", digits = NA)

## ---------------------------------------------------------------- cities ----
cities <- list(
  list(id="berlin",     label="Berlin",      country="Germany",        loc="52.24N-13.14E"),
  list(id="tokyo",      label="Tokyo",       country="Japan",          loc="36.17N-139.23E"),
  list(id="detroit",    label="Detroit",     country="United States",  loc="42.59N-82.91W"),
  list(id="birmingham", label="Birmingham",  country="United Kingdom", loc="52.24N-2.63W"),
  list(id="lisbon",     label="Lisbon",      country="Portugal",       loc="39.38N-8.32W"),
  list(id="reykjavik",  label="Reykjavík", country="Iceland",     loc="65.09N-21.06W"),
  list(id="oslo",       label="Oslo",        country="Norway",         loc="60.27N-9.73E"),
  list(id="paris",      label="Paris",       country="France",         loc="49.03N-2.45E"),
  list(id="chicago",    label="Chicago",     country="United States",  loc="42.59N-87.27W"),
  list(id="newyork",    label="New York",    country="United States",  loc="40.99N-74.56W"),
  list(id="manchester", label="Manchester",  country="United Kingdom", loc="53.84N-1.36W"),
  list(id="london",     label="London",      country="United Kingdom", loc="52.24N-0.00W"),
  list(id="delhi",      label="Delhi",       country="India",          loc="28.13N-77.27E"),
  list(id="lagos",      label="Lagos",       country="Nigeria",        loc="5.63N-3.23E"),
  list(id="saopaulo",   label="São Paulo", country="Brazil",      loc="23.31S-46.31W"),
  list(id="sydney",     label="Sydney",      country="Australia",      loc="34.56S-151.78E"),
  list(id="cairo",      label="Cairo",       country="Egypt",          loc="29.74N-31.38E"),
  list(id="nairobi",    label="Nairobi",     country="Kenya",          loc="0.80S-36.16E"),
  list(id="moscow",     label="Moscow",      country="Russia",         loc="55.45N-36.85E"),
  list(id="singapore",  label="Singapore",   country="Singapore",      loc="0.80N-103.66E"),
  list(id="jakarta",    label="Jakarta",     country="Indonesia",      loc="5.63S-106.55E"),
  list(id="mexicocity", label="Mexico City", country="Mexico",         loc="20.09N-98.96W")
)

trend_url <- "https://berkeley-earth-temperature.s3.us-west-1.amazonaws.com/Local/TAVG/Text/%s-TAVG-Trend.txt"

parse_normals <- function(lines) {
  start <- grep("monthly absolute temperature", lines, ignore.case = TRUE)[1]
  if (is.na(start)) return(rep(NA_real_, 12))
  cand <- lines[(start + 1):min(length(lines), start + 8)]
  vl <- cand[grepl("^%%\\s*[-0-9]", cand)][1]
  if (is.na(vl)) return(rep(NA_real_, 12))
  nums <- scan(text = gsub("^%%", "", vl), quiet = TRUE)
  if (length(nums) < 12) rep(NA_real_, 12) else nums[1:12]
}

index <- list()
for (ci in cities) {
  url <- sprintf(trend_url, ci$loc)
  lines <- tryCatch(iconv(readLines(url, warn = FALSE), "latin1", "UTF-8", sub = ""),
                    error = function(e) NULL)
  if (is.null(lines)) { cat("SKIP (download failed):", ci$label, "\n"); next }
  normals <- parse_normals(lines)
  dl <- lines[grepl("^\\s*[0-9]{4}\\s+[0-9]{1,2}\\s+", lines)]
  tab <- read.table(text = dl, na.strings = "NaN",
    col.names = c("year","month","anomaly","unc","annual","annual_unc",
                  "five","five_unc","ten","ten_unc","twenty","twenty_unc"))
  tab <- tab[!is.na(tab$anomaly) & tab$year <= 2023, ]
  tab <- tab[order(tab$year, tab$month), ]
  out <- list(
    id = ci$id, label = ci$label, country = ci$country, location = ci$loc,
    source = paste0("Berkeley Earth, ", ci$loc, " (TAVG)"),
    normals = rnd(normals, 2),
    first_year = min(tab$year), last_year = max(tab$year),
    year = tab$year, month = tab$month,
    anomaly = rnd(tab$anomaly), unc = rnd(tab$unc, 2), ten = rnd(tab$ten)
  )
  write_json(out, file.path(out_dir, "cities", paste0(ci$id, ".json")),
             auto_unbox = TRUE, na = "null", digits = NA)
  index[[length(index) + 1]] <- list(id = ci$id, label = ci$label,
    country = ci$country, location = ci$loc,
    first_year = min(tab$year), last_year = max(tab$year))
  cat(sprintf("city %-11s %d-%d (%d months)\n", ci$id, min(tab$year), max(tab$year), nrow(tab)))
  Sys.sleep(0.4)
}
write_json(index, file.path(out_dir, "cities.json"), auto_unbox = TRUE, na = "null")
cat("done:", length(index), "cities\n")
