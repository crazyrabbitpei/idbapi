NOW=`date +'%Y%m%d_%H%M%S' `
echo "key server start"
node keyapi.js > ./log/getkey/$NOW
