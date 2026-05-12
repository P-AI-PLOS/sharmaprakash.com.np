---
title: 6 awesome git tricks you should start using immediately
minute: 3
directory:
excerpt: 6 awesome git tricks you should be using in 2019
tags: git
toc: true
header:
  og_image: /assets/images/posts/6-git-tricks-1.jpg
  teaser: /assets/images/posts/6-git-tricks-1.jpg
date: "2019-03-17T08:42:12+05:45"
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/blog5.png"
show_category_hero_image: false
---

## Merging your current change to previous commit

How often does this happen to you?

You detect a silly mistake as soon as you make commit. But did you know you can add those content to previous commit with this simple command?

```sh
# add your content
git add .
# merge content to previous commit
git commit --ammend
```
<BlogDetailsNoticeWrapper class="notice--info block">
Please take care that you have not pushed the commit to remote yet else you will have to force push after using this trick.
</BlogDetailsNoticeWrapper>

## Check git differences and omit whitespaces

When you are taking over someone else's code, chances are high that they may have different editor settings than yours.

As a result, whenever you save your code, there is lots of whitespace changes. This gets even messier when you are trying `git diff `  to cross-check changes you have made.

You can do `git diff --ignore-all-space` or `git diff -w` to compare changes without space.

## Stash with message
`git stash` & `git stash apply` is almost every developer's favourite when they just want to try some thing from clean state.

But I highly doubt that default messages created by `git stash` in the format `“WIP on <branch></branch>: <whatever the latest commit message was>”` would be anyone's favourite. It becomes more annoying to recognize stash you need when you have multiple stashes.

But git stash can be created with message you would like to give to your future self with this command:

```
git stash save -u 'come back if to here if attempt on elastic search didn't work'
```

## Clone fast with only one commit
One of the funniest thing of being shifted to some old project is that first clone of the project taking upto an hour and worst failing in middle.

There is nothing one can really do if that is because repo has some heavy files but if that is due to large number of commits in the repo, we can always clone repo with only last commit using  following command:

```
git clone --depth=1 <remote_repo_url>
```

This allows you to reate a shallow clone with a history truncated to the specified number of commits.

## Combining all commits in your branch

Frequently creating commits is a good practice while doing development works, but coming up with good message every commit is not every one's cup of tea. So by the time your feature branch is ready to be merged, you will probably have lots of commits with not so meaningful messages.

Merging all commits on your feature branch before sending it for code review will probably keep your code base's git history a lot cleaner.

```sh
git checkout yourBranch
git reset $(git merge-base master yourBranch)
git add -A
git commit -m "one commit on yourBranch"
```

## Rebasing

It is advisable to merge latest branch to your feature branch before you start your new day's work. But, merging development codes to the working branch creates one additional merge commit and make git history looks dirty.

Instead of merging you can rebase your branch to development/master:

```sh
git checkout development
git pull origin development
git checkout my-feature-branch
git rebase development
```
<BlogDetailsNoticeWrapper class="notice--info block">
You will have to force push after rebasing.
</BlogDetailsNoticeWrapper>

However I would never recommend rebasing to beginners, as there may be more merge conflicts and merge conflicts are easily beginner's nightmares. Also to avoid more merge conflicts I squash all commits in my branch before rebasing.

Would you try any of these tips in your workflow? Were you already using any of these tips? Leave your comments below and let me know.

I would also like to know other cool git commands you may be using that is not so commonly used.

References: <br />
- <a href=https://stackoverflow.com/questions/25356810/git-how-to-squash-all-commits-on-branch rel="nofollow" target="_blank">https://stackoverflow.com/questions/25356810/git-how-to-squash-all-commits-on-branch</a>
