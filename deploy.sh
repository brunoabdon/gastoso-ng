#!/bin/sh
DISTDIR=".dist"

if [ ! -d "$DISTDIR" ]; then
  git clone https://github.com/brunoabdon/gastoso.git -b gh-pages --depth 1 --separate-git-dir .deploygit  $DISTDIR
fi

cd $DISTDIR
git checkout .
cd ..
rm -r $DISTDIR/*
cp -r app/* $DISTDIR
cp bower.json $DISTDIR
cd $DISTDIR
echo "{\"directory\": \"bower_components\"}" > .bowerrc
bower install
echo ".bowerrc\nbower.json\n.gitignore" > .gitignore
git add --all .
git status
git commit -m 'publicando'
git push 

