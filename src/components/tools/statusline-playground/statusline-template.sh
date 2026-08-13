#!/bin/bash
# Segment values are assembled with printf -v and read indirectly by
# join_segments; ANSI/OSC sequences intentionally live in format strings.
# shellcheck disable=SC1003,SC2016,SC2034,SC2059,SC2154,SC2329
input=$(cat)

layout=__LAYOUT__
capture_payload=__CAPTURE_PAYLOAD__
hyperlinks=__HYPERLINKS__
want_ci=__WANT_CI__
want_gsd=__WANT_GSD__
want_openspec=__WANT_OPENSPEC__
want_beads=__WANT_BEADS__
custom_text=__CUSTOM_TEXT__

cache_dir="$HOME/.cache/claude-statusline"
if [ "$capture_payload" = "true" ] || [ "$want_ci" = "true" ] || [ "$want_beads" = "true" ]; then
  mkdir -p "$cache_dir" 2>/dev/null
fi
[ "$capture_payload" = "true" ] && printf '%s' "$input" > "$cache_dir/last-input.json" 2>/dev/null

# One jq call, with a non-whitespace separator so empty middle fields stay put.
IFS=$'\x1f' read -r cwd model in_tok out_tok lines_add lines_rem ctx ctx_size style \
  sess_name effort fast rl5 rl5_reset rl7 rl7_reset wt gwt pr_num pr_url pr_state \
  dur_ms cost_usd x200k repo_host repo_owner repo_name cur_in cache_rd cache_cr \
  api_ms think < <(
  printf '%s' "$input" | jq -r '[
    .cwd // "",
    .model.display_name // "",
    .context_window.total_input_tokens // 0,
    .context_window.total_output_tokens // 0,
    .cost.total_lines_added // 0,
    .cost.total_lines_removed // 0,
    .context_window.remaining_percentage // "",
    .context_window.context_window_size // 0,
    .output_style.name // "",
    .session_name // "",
    .effort.level // "",
    (.fast_mode // false),
    .rate_limits.five_hour.used_percentage // "",
    .rate_limits.five_hour.resets_at // 0,
    .rate_limits.seven_day.used_percentage // "",
    .rate_limits.seven_day.resets_at // 0,
    .worktree.name // "",
    .workspace.git_worktree // "",
    .pr.number // "",
    .pr.url // "",
    .pr.review_state // "",
    .cost.total_duration_ms // 0,
    .cost.total_cost_usd // "",
    (.exceeds_200k_tokens // false),
    .workspace.repo.host // "",
    .workspace.repo.owner // "",
    .workspace.repo.name // "",
    .context_window.current_usage.input_tokens // 0,
    .context_window.current_usage.cache_read_input_tokens // 0,
    .context_window.current_usage.cache_creation_input_tokens // 0,
    .cost.total_api_duration_ms // 0,
    (.thinking.enabled // false)
  ] | map(tostring) | join("\u001f")' 2>/dev/null
)

in_tok=${in_tok:-0}; out_tok=${out_tok:-0}
lines_add=${lines_add:-0}; lines_rem=${lines_rem:-0}
ctx_size=${ctx_size:-0}; rl5_reset=${rl5_reset:-0}; rl7_reset=${rl7_reset:-0}
dur_ms=${dur_ms:-0}; api_ms=${api_ms:-0}
cur_in=${cur_in:-0}; cache_rd=${cache_rd:-0}; cache_cr=${cache_cr:-0}

GREEN=$'\033[0;32m'; YELLOW=$'\033[0;33m'; RED=$'\033[0;31m'
DIM=$'\033[2m'; RESET=$'\033[0m'
__COLOR_ASSIGNMENTS__

now=$(date +%s)
case "$cwd" in
  "$HOME")   short_cwd="~" ;;
  "$HOME"/*) short_cwd="~${cwd#"$HOME"}" ;;
  *)         short_cwd="$cwd" ;;
esac

humanize() {
  local n=${1:-0}
  if   [ "$n" -ge 1000000 ]; then printf "%s.%sM" "$((n/1000000))" "$(( (n/100000)%10 ))"
  elif [ "$n" -ge 1000 ];    then printf "%s.%sk" "$((n/1000))" "$(( (n/100)%10 ))"
  else printf "%s" "$n"
  fi
}

fmt_span() {
  local t=${1:-0}
  [ "$t" -le 0 ] && return
  local d=$((t/86400)) h=$((t%86400/3600)) m=$((t%3600/60))
  if   [ "$d" -gt 0 ]; then printf "%sd%sh" "$d" "$h"
  elif [ "$h" -gt 0 ]; then printf "%sh%sm" "$h" "$m"
  else printf "%sm" "$m"
  fi
}

link_value() {
  local target=$1 url=$2 label=$3 esc=$'\033'
  printf -v "$target" '%s]8;;%s%s\\%s%s]8;;%s\\' "$esc" "$url" "$esc" "$label" "$esc" "$esc"
}

join_segments() {
  local target=$1 result="" name var value
  shift
  for name in "$@"; do
    var="seg_$name"
    value=${!var-}
    [ -n "$value" ] && result="${result}${result:+  }$value"
  done
  printf -v "$target" '%s' "$result"
}

print_row() {
  local left=$1 right=$2 right_text=$3
  [ -z "$left" ] && [ -z "$right" ] && return
  if [ -z "$right" ]; then printf '%s\n' "$left"; return; fi
  local plain cols pad
  plain=$(printf '%s' "$left" | sed -E $'s/\x1b\\[[0-9;]*m//g; s/\x1b]8;;[^\x1b]*\x1b\\\\//g')
  cols=${COLUMNS:-0}
  [ "$cols" -gt 0 ] 2>/dev/null || cols=$(tput cols 2>/dev/null || echo 120)
  pad=$(( cols - 4 - ${#plain} - ${#right_text} ))
  [ "$pad" -lt 1 ] && pad=1
  printf '%s%*s%s\n' "$left" "$pad" "" "$right"
}

# Git branch plus dirty/ahead/behind state, from one status call.
branch=""; branch_text=""
if [ -n "$cwd" ] && { [ -d "$cwd/.git" ] || git -C "$cwd" rev-parse --git-dir >/dev/null 2>&1; }; then
  gs=$(git -C "$cwd" --no-optional-locks status --porcelain=v2 --branch 2>/dev/null)
  read -r branch ab_a ab_b dirty < <(awk '
    $2=="branch.head" {b=$3}
    $2=="branch.ab"   {a=$3; c=$4}
    !/^#/ && NF       {d=1}
    END {print (b?b:"-"), (a?a:"+0"), (c?c:"-0"), (d?1:0)}
  ' <<<"$gs")
  branch_text="$branch"
  [ "$dirty" = "1" ]  && branch_text="${branch_text}*"
  [ "$ab_a" != "+0" ] && branch_text="${branch_text}↑${ab_a#+}"
  [ "$ab_b" != "-0" ] && branch_text="${branch_text}↓${ab_b#-}"
fi

total_tok=$(( in_tok + out_tok ))
tok_str=$(humanize "$total_tok")

seg_cwd=""
if [ -n "$short_cwd" ]; then
  cwd_label=$short_cwd
  [ "$hyperlinks" = "true" ] && link_value cwd_label "file://$cwd" "$short_cwd"
  printf -v seg_cwd "${SEG_CWD}%s${RESET}" "$cwd_label"
fi

seg_branch=""
if [ -n "$branch_text" ]; then
  branch_label=$branch_text
  if [ "$hyperlinks" = "true" ] && [ -n "$repo_host" ] && [ "$branch" != "-" ]; then
    link_value branch_label "https://$repo_host/$repo_owner/$repo_name/tree/$branch" "$branch_text"
  fi
  printf -v seg_branch "${DIM}(${RESET}${SEG_BRANCH}%s${RESET}${DIM})${RESET}" "$branch_label"
fi

model_short="${model% (1M context)}"
seg_model=""
if [ -n "$model_short" ]; then
  printf -v seg_model "${SEG_MODEL}%s${RESET}" "$model_short"
  if [ "$layout" = "three" ]; then
    qualifiers=""
    [ -n "$effort" ] && qualifiers="$effort"
    [ "$fast" = "true" ] && qualifiers="${qualifiers}${qualifiers:+,}fast"
    [ "$think" = "true" ] && qualifiers="${qualifiers}${qualifiers:+,}think"
    [ -n "$qualifiers" ] && printf -v seg_model "%s ${DIM}(%s)${RESET}" "$seg_model" "$qualifiers"
  fi
fi

seg_tokens=""
[ "$total_tok" -gt 0 ] && printf -v seg_tokens "${SEG_TOKENS}%s tok${RESET}" "$tok_str"

seg_diff=""
if [ "$lines_add" -gt 0 ] || [ "$lines_rem" -gt 0 ]; then
  printf -v seg_diff "${SEG_DIFF}+%s${RESET}${DIM}/${RESET}${RED}-%s${RESET}" "$lines_add" "$lines_rem"
fi

seg_context=""
if [ -n "$ctx" ]; then
  ctx_int=${ctx%.*}; ctx_int=${ctx_int:-0}; ctx_color=$RED
  [ "$ctx_int" -ge 20 ] && ctx_color=$YELLOW
  [ "$ctx_int" -gt 50 ] && ctx_color=$GREEN
  if [ "$layout" = "three" ] && [ "$ctx_size" -gt 0 ] 2>/dev/null; then
    used_tok=$(( ctx_size - ctx_size * ctx_int / 100 ))
    printf -v seg_context "${SEG_CONTEXT}ctx:${RESET}${ctx_color}%s${RESET}${DIM}/%s (%s%% free)${RESET}" \
      "$(humanize "$used_tok")" "$(humanize "$ctx_size")" "$ctx_int"
  else
    printf -v seg_context "${ctx_color}ctx:%s%%${RESET}" "$ctx_int"
  fi
fi

seg_cache=""
cache_tot=$(( cur_in + cache_rd + cache_cr ))
if [ "$cache_tot" -gt 0 ]; then
  if [ "$layout" = "three" ]; then
    cache_pct=$(( cache_rd * 100 / cache_tot )); cache_color=$SEG_CACHE
    [ "$cache_pct" -lt 80 ] && cache_color=$YELLOW
    [ "$cache_pct" -lt 50 ] && cache_color=$RED
    printf -v seg_cache "${cache_color}cache:%s%%${RESET}" "$cache_pct"
  else
    ratio=99
    [ "$cache_rd" -gt 0 ] && [ "$cache_cr" -gt 0 ] && ratio=$(( cache_rd / cache_cr ))
    cache_color=$GREEN
    [ "$ratio" -lt 20 ] && cache_color=$YELLOW
    [ "$ratio" -lt 5 ] && cache_color=$RED
    printf -v seg_cache "${cache_color}cc:%s${RESET}${DIM}|cr:%s${RESET}" \
      "$(humanize "$cache_cr")" "$(humanize "$cache_rd")"
  fi
fi

build_rate_segment() {
  local target=$1 label=$2 pct=$3 reset_at=${4:-0} soften=$5 window=$6 base_color=$7
  [ -z "$pct" ] && return
  local p=${pct%.*} text="" color=$base_color rem=$(( reset_at - now )) elapsed_pct countdown
  p=${p:-0}
  if [ "$layout" = "one" ]; then
    [ "$p" -gt 0 ] && printf -v "$target" "${SEG_RATE5}%s:%s%%${RESET}" "$label" "$p"
    return
  fi
  [ "$p" -ge 50 ] && color=$YELLOW
  [ "$p" -ge 80 ] && color=$RED
  if [ "$rem" -gt 0 ] && [ "$rem" -le "$soften" ]; then
    [ "$color" = "$RED" ] && color=$YELLOW
    [ "$color" = "$YELLOW" ] && color=$DIM
  fi
  text="$label:$p%"
  if [ "$window" -gt 0 ] && [ "$rem" -gt 0 ] && [ "$rem" -lt "$window" ]; then
    elapsed_pct=$(( (window - rem) * 100 / window ))
    [ "$p" -ge 30 ] && [ "$p" -gt $((elapsed_pct + 10)) ] && text="${text}▲"
  fi
  countdown=$(fmt_span "$rem")
  [ -n "$countdown" ] && text="${text}(${countdown})"
  printf -v "$target" "${color}%s${RESET}" "$text"
}

seg_rate5=""; seg_rate7=""
build_rate_segment seg_rate5 "5h" "$rl5" "$rl5_reset" 1800 18000 "$SEG_RATE5"
if [ "$layout" = "three" ]; then
  build_rate_segment seg_rate7 "7d" "$rl7" "$rl7_reset" 43200 604800 "$SEG_RATE7"
fi

seg_style=""
[ -n "$style" ] && [ "$style" != "default" ] && printf -v seg_style "${SEG_STYLE}[%s]${RESET}" "$style"

seg_x200k=""
[ "$x200k" = "true" ] && printf -v seg_x200k "${SEG_X200K}!200k${RESET}"

seg_cost=""
if [ -n "$cost_usd" ]; then
  cost_str=$(printf '$%.2f' "$cost_usd" 2>/dev/null)
  if [ -n "$cost_str" ] && [ "$cost_str" != '$0.00' ]; then
    rate_str=""
    if [ "$layout" = "three" ] && [ "$dur_ms" -ge 300000 ]; then
      cents=${cost_str#\$}; cents=${cents/./}; rate=$(( cents * 36000 / dur_ms ))
      [ "$rate" -ge 1 ] && rate_str="~\$$rate/h"
    fi
    printf -v seg_cost "${SEG_COST}%s%s${RESET}" "$cost_str" "${rate_str:+($rate_str)}"
  fi
fi

seg_time=""
printf -v seg_time "${SEG_TIME}%s${RESET}" "$(date +%H:%M)"
seg_custom=""
[ -n "$custom_text" ] && printf -v seg_custom "${SEG_CUSTOM}%s${RESET}" "$custom_text"

wt_name=${wt:-$gwt}; seg_worktree=""
[ -n "$wt_name" ] && printf -v seg_worktree "${SEG_WORKTREE}⎇ %s${RESET}" "$wt_name"

seg_session=""
[ -n "$sess_name" ] && printf -v seg_session "${SEG_SESSION}@%s${RESET}" "$sess_name"

dur_str=$(fmt_span $(( dur_ms / 1000 ))); seg_duration=""
[ -n "$dur_str" ] && printf -v seg_duration "${SEG_DURATION}up:%s${RESET}" "$dur_str"

seg_api=""
if [ "$api_ms" -gt 0 ] && [ "$dur_ms" -gt 0 ]; then
  api_pct=$(( api_ms * 100 / dur_ms ))
  printf -v seg_api "${SEG_API}api:%s%%${RESET}" "$api_pct"
fi

seg_pr=""
if [ -n "$pr_num" ]; then
  case "$pr_state" in
    approved)          pr_icon="✓"; pr_color=$GREEN ;;
    changes_requested) pr_icon="✗"; pr_color=$RED ;;
    draft)             pr_icon="◐"; pr_color=$DIM ;;
    pending)           pr_icon="●"; pr_color=$YELLOW ;;
    *)                 pr_icon="";  pr_color=$SEG_PR ;;
  esac
  pr_label="#$pr_num$pr_icon"
  [ "$hyperlinks" = "true" ] && [ -n "$pr_url" ] && link_value pr_label "$pr_url" "$pr_label"
  printf -v seg_pr "${pr_color}%s${RESET}" "$pr_label"
fi

root=""
[ -n "$branch_text" ] && root=$(git -C "$cwd" rev-parse --show-toplevel 2>/dev/null)
[ -z "$root" ] && root=$cwd
key=$(printf '%s' "$root" | cksum); key=${key%% *}

file_age() {
  local modified
  modified=$(stat -f %m "$1" 2>/dev/null || stat -c %Y "$1" 2>/dev/null || echo 0)
  printf '%s' "$(( now - modified ))"
}

seg_ci=""
if [ "$want_ci" = "true" ] && [ -n "$pr_num" ] && command -v gh >/dev/null 2>&1; then
  ci_cache="$cache_dir/ci-$key-$pr_num"; ci_age=999999; ci_state=""; ci_stale=""
  if [ -f "$ci_cache" ]; then
    ci_state=$(<"$ci_cache"); ci_age=$(file_age "$ci_cache")
    [ "$ci_age" -ge 120 ] && ci_stale="~"
  fi
  if [ "$ci_age" -ge 120 ]; then
    ( cd "$root" || exit
      if gh pr checks "$pr_num" --json bucket 2>/dev/null \
          | jq -r 'if length==0 then "none" elif any(.[]; .bucket=="fail") then "fail" elif any(.[]; .bucket=="pending") then "pending" else "pass" end' \
          > "$ci_cache.$$" 2>/dev/null; then
        mv -f "$ci_cache.$$" "$ci_cache"
      else
        rm -f "$ci_cache.$$"
      fi
    ) >/dev/null 2>&1 &
  fi
  case "$ci_state" in
    fail)    printf -v seg_ci "${RED}ci:x%s${RESET}" "$ci_stale" ;;
    pending) printf -v seg_ci "${YELLOW}ci:~%s${RESET}" "$ci_stale" ;;
    pass)    printf -v seg_ci "${SEG_CI}ci:ok%s${RESET}" "$ci_stale" ;;
  esac
fi

seg_gsd=""
if [ "$want_gsd" = "true" ] && [ -f "$root/.planning/STATE.md" ]; then
  read -r g_phase g_status g_done g_total < <(awk -F': ' '
    NR>30 {exit}
    {gsub(/^[ \t]+/, "", $1)}
    $1=="current_phase" {p=$2} $1=="status" {s=$2}
    $1=="completed_plans" {c=$2} $1=="total_plans" {t=$2}
    END {print (p!=""?p:"-"), (s!=""?s:"-"), (c!=""?c:0), (t!=""?t:0)}
  ' "$root/.planning/STATE.md")
  case "$g_status" in executing) g_glyph="▶" ;; complete*) g_glyph="✓" ;; blocked*) g_glyph="✗" ;; *) g_glyph="◆" ;; esac
  printf -v seg_gsd "${SEG_GSD}gsd:%s %s${RESET}" "$g_phase" "$g_glyph"
  [ "$g_total" -gt 0 ] 2>/dev/null && printf -v seg_gsd "%s ${DIM}%s/%s${RESET}" "$seg_gsd" "$g_done" "$g_total"
  [ -f "$root/.planning/HANDOFF.md" ] && printf -v seg_gsd "%s ${RED}handoff!${RESET}" "$seg_gsd"
fi

seg_openspec=""
if [ "$want_openspec" = "true" ] && [ -d "$root/openspec/changes" ]; then
  os_new=0; os_wip=0
  for proposal in "$root"/openspec/changes/*/; do
    [ -d "$proposal" ] || continue
    case "$proposal" in */archive/) continue ;; esac
    if [ -f "${proposal}tasks.md" ] && grep -q '\[x\]' "${proposal}tasks.md" 2>/dev/null; then
      os_wip=$((os_wip+1))
    else
      os_new=$((os_new+1))
    fi
  done
  [ $((os_new + os_wip)) -gt 0 ] && printf -v seg_openspec "${SEG_OPENSPEC}os new:%s wip:%s${RESET}" "$os_new" "$os_wip"
fi

seg_beads=""
if [ "$want_beads" = "true" ] && [ -d "$root/.beads" ] && command -v bd >/dev/null 2>&1; then
  beads_cache="$cache_dir/bds-$key"; beads_age=999999; bd_ready=""; bd_wip=""; bd_blocked=""
  if [ -f "$beads_cache" ]; then
    read -r bd_ready bd_wip bd_blocked < "$beads_cache"
    beads_age=$(file_age "$beads_cache")
  fi
  if [ "$beads_age" -ge 120 ]; then
    ( cd "$root" || exit
      if bd stats --json 2>/dev/null \
          | jq -r '.summary | "\(.ready_issues) \(.in_progress_issues) \(.blocked_issues)"' \
          > "$beads_cache.$$" 2>/dev/null; then
        mv -f "$beads_cache.$$" "$beads_cache"
      else
        rm -f "$beads_cache.$$"
      fi
    ) >/dev/null 2>&1 &
  fi
  case "$bd_ready" in ''|*[!0-9]*) bd_ready="" ;; esac
  if [ -n "$bd_ready" ] && [ $((bd_ready + ${bd_wip:-0} + ${bd_blocked:-0})) -gt 0 ]; then
    printf -v seg_beads "${SEG_BEADS}bd ready:%s wip:%s blocked:%s%s${RESET}" \
      "$bd_ready" "${bd_wip:-0}" "${bd_blocked:-0}" "$([ "$beads_age" -ge 120 ] && printf '~')"
  fi
fi

__RENDER_ROWS__
exit 0
