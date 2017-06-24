#!/usr/bin/env sh

if [ -f ../.env ];
then
	# Automatically export variables set
	set -a
	. ../.env
	# Stop automatically exporting variables set
	set +a
fi;

if [ -z $WEB_SOCKETS_URL ];
then
	npm run build-sockets-app
fi;

if [ -z $STATIC_CONTENT_URL ];
then
	npm run build-static
fi;
