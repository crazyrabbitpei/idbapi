NOW=`date +'%Y%m%d_%H%M%S' `
echo "manage server start"
node idbapi.js > ./log/manage/$NOW
