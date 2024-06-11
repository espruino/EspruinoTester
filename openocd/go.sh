
sudo ./openocd -f nrf52.cfg
ERRCODE=$?
if [ $ERRCODE -eq 0 ]; then
    echo "SUCCESS!"
else
    echo "ERROR :("
fi
exit $ERRCODE
