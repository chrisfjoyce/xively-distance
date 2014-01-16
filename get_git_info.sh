date "+%d %B %Y - " > app/git_info.txt
git log -1 --format="%h" >> app/git_info.txt
cat app/git_info.txt