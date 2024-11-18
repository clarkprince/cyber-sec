curl -v \
     -d name="$(basename $SCRIPT)" \
     -d script="$(cat $SCRIPT)" \
     -d path="path/to/excel" \
     -d type=excel \
     -d action=save \
     -d title="$(basename $SCRIPT)" \
     -b __Host-t.sftw.kraken="$COOKIE" \
     https://localhost:5000/api/datasource