#!/bin/bash
set -e
set -x
if (( $(id -u) == 0 )); then
  echo "I'm root"
else
  echo "show use root"
  exit 0
fi

fastboot=/home/lee/Programs/platform-tools/fastboot
$fastboot "$@" getvar product 2>&1 | grep -E "^product: *monet" || echo "Missmatching image and device"
$fastboot "$@" getvar product 2>&1 | grep -E "^product: *monet" || exit 1

# check anti_version
if [ -f "$0/images/anti_version.txt" ]; then
  CURRENT_ANTI_VER=$(awk -F= '{print $2}' "$0/images/anti_version.txt")
fi
CURRENT_ANTI_VER=${CURRENT_ANTI_VER:-0}

version=$($fastboot "$@" getvar anti 2>&1 | grep -E "anti:" | awk '{print $2}')
version=${version:-0}

anticheck="antirollback check pass"
if [ "$version" -gt "$CURRENT_ANTI_VER" ]; then
  anticheck="Current device antirollback version is greater than this package"
fi
echo "$anticheck" | grep -E "pass" || { echo "Antirollback check error"; exit 1; }

$fastboot "$@" erase boot || { echo "Erase boot error"; exit 1; }
$fastboot "$@" flash crclist "$0/images/crclist.txt" || { echo "Flash crclist error"; exit 1; }
$fastboot "$@" flash sparsecrclist "$0/images/sparsecrclist.txt" || { echo "Flash sparsecrclist error"; exit 1; }
$fastboot "$@" flash xbl "$0/images/xbl.elf" || { echo "Flash xbl error"; exit 1; }
$fastboot "$@" flash xblbak "$0/images/xbl.elf" || { echo "Flash xblbak error"; exit 1; }
$fastboot "$@" flash xbl_config "$0/images/xbl_config.elf" || { echo "Flash xbl_config error"; exit 1; }
$fastboot "$@" flash xbl_configbak "$0/images/xbl_config.elf" || { echo "Flash xbl_configbak error"; exit 1; }
$fastboot "$@" flash abl "$0/images/abl.elf" || { echo "Flash abl error"; exit 1; }
$fastboot "$@" flash ablbak "$0/images/abl.elf" || { echo "Flash ablbak error"; exit 1; }
$fastboot "$@" flash tz "$0/images/tz.mbn" || { echo "Flash tz error"; exit 1; }
$fastboot "$@" flash tzbak "$0/images/tz.mbn" || { echo "Flash tzbak error"; exit 1; }
$fastboot "$@" flash hyp "$0/images/hyp.mbn" || { echo "Flash hyp error"; exit 1; }
$fastboot "$@" flash hypbak "$0/images/hyp.mbn" || { echo "Flash hypbak error"; exit 1; }
$fastboot "$@" flash devcfg "$0/images/devcfg.mbn" || { echo "Flash devcfg error"; exit 1; }
$fastboot "$@" flash devcfgbak "$0/images/devcfg.mbn" || { echo "Flash devcfgbak error"; exit 1; }
$fastboot "$@" flash storsec "$0/images/storsec.mbn" || { echo "Flash storsec error"; exit 1; }
# $fastboot "$@" flash storsecbak "$0/images/storsec.mbn" || { echo "Flash storsecbak error"; exit 1; }
$fastboot "$@" flash bluetooth "$0/images/BTFM.bin" || { echo "Flash bluetooth error"; exit 1; }
$fastboot "$@" flash cmnlib "$0/images/cmnlib.mbn" || { echo "Flash cmnlib error"; exit 1; }
$fastboot "$@" flash cmnlibbak "$0/images/cmnlib.mbn" || { echo "Flash cmnlibbak error"; exit 1; }
$fastboot "$@" flash cmnlib64 "$0/images/cmnlib64.mbn" || { echo "Flash cmnlib64 error"; exit 1; }
$fastboot "$@" flash cmnlib64bak "$0/images/cmnlib64.mbn" || { echo "Flash cmnlib64bak error"; exit 1; }
$fastboot "$@" flash modem "$0/images/NON-HLOS.bin" || { echo "Flash modem error"; exit 1; }
$fastboot "$@" flash dsp "$0/images/dspso.bin" || { echo "Flash dsp error"; exit 1; }
$fastboot "$@" flash metadata "$0/images/metadata.img" || { echo "Flash metadata error"; exit 1; }
$fastboot "$@" flash keymaster "$0/images/km4.mbn" || { echo "Flash keymaster error"; exit 1; }

$fastboot "$@" flash keymasterbak images/km4.mbn || { echo "Flash keymasterbak error"; exit 1; }
$fastboot "$@" flash logo images/logo.img || { echo "Flash logo error"; exit 1; }
# $fastboot "$@" flash splash images/splash.img || { echo "Flash splash error"; exit 1; }
$fastboot "$@" flash featenabler images/featenabler.mbn || { echo "Flash featenabler error"; exit 1; }
$fastboot "$@" flash misc images/misc.img || { echo "Flash misc error"; exit 1; }
$fastboot "$@" flash aop images/aop.mbn || { echo "Flash aop error"; exit 1; }
$fastboot "$@" flash aopbak images/aop.mbn || { echo "Flash aopbak error"; exit 1; }
$fastboot "$@" flash qupfw images/qupv3fw.elf || { echo "Flash qupfw error"; exit 1; }
$fastboot "$@" flash qupfwbak images/qupv3fw.elf || { echo "Flash qupfwbak error"; exit 1; }
$fastboot "$@" flash imagefv images/imagefv.elf || { echo "Flash imagefv error"; exit 1; }
$fastboot "$@" flash imagefvbak images/imagefv.elf || { echo "Flash imagefvbak error"; exit 1; }
$fastboot "$@" flash uefisecapp images/uefi_sec.mbn || { echo "Flash uefisecapp error"; exit 1; }
$fastboot "$@" flash uefisecappbak images/uefi_sec.mbn || { echo "Flash uefisecappbak error"; exit 1; }
$fastboot "$@" flash multiimgoem images/multi_image.mbn || { echo "Flash multiimgoem error"; exit 1; }
$fastboot "$@" flash vbmeta_system images/vbmeta_system.img || { echo "Flash vbmeta_system error"; exit 1; }
$fastboot "$@" flash vbmeta images/vbmeta.img || { echo "Flash vbmeta error"; exit 1; }
$fastboot "$@" flash dtbo images/dtbo.img || { echo "Flash dtbo error"; exit 1; }
$fastboot "$@" flash cache images/cache.img || { echo "Flash cache error"; exit 1; }
$fastboot "$@" flash userdata images/userdata.img || { echo "Flash userdata error"; exit 1; }
$fastboot "$@" flash recovery images/recovery.img || { echo "Flash recovery error"; exit 1; }
# $fastboot "$@" erase sec || { echo "Erase sec error"; exit 1; }
$fastboot "$@" flash cust images/cust.img || { echo "Flash cust error"; exit 1; }
$fastboot "$@" flash super images/super.img || { echo "Flash super error"; exit 1; }
$fastboot "$@" flash boot images/boot.img || { echo "Flash boot error"; exit 1; }
