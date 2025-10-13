// https://github.com/GoogleChromeLabs/webbundle-plugins/blob/main/packages/rollup-plugin-webbundle/src/index.ts
// https://github.com/GoogleChromeLabs/webbundle-plugins/tree/main/packages/shared
// bun build --packages=bundle --target=node --outfile=wbn-bundle-full.js wbn-bundle.js
// wbn-bundle.js
import { createRequire } from "node:module";
import { webcrypto } from "node:crypto";
import * as fs from "fs";
import * as path from "path";

// node_modules/mime/dist/types/other.js
var types = {
  "application/prs.cww": ["cww"],
  "application/prs.xsf+xml": ["xsf"],
  "application/vnd.1000minds.decision-model+xml": ["1km"],
  "application/vnd.3gpp.pic-bw-large": ["plb"],
  "application/vnd.3gpp.pic-bw-small": ["psb"],
  "application/vnd.3gpp.pic-bw-var": ["pvb"],
  "application/vnd.3gpp2.tcap": ["tcap"],
  "application/vnd.3m.post-it-notes": ["pwn"],
  "application/vnd.accpac.simply.aso": ["aso"],
  "application/vnd.accpac.simply.imp": ["imp"],
  "application/vnd.acucobol": ["acu"],
  "application/vnd.acucorp": ["atc", "acutc"],
  "application/vnd.adobe.air-application-installer-package+zip": ["air"],
  "application/vnd.adobe.formscentral.fcdt": ["fcdt"],
  "application/vnd.adobe.fxp": ["fxp", "fxpl"],
  "application/vnd.adobe.xdp+xml": ["xdp"],
  "application/vnd.adobe.xfdf": ["*xfdf"],
  "application/vnd.age": ["age"],
  "application/vnd.ahead.space": ["ahead"],
  "application/vnd.airzip.filesecure.azf": ["azf"],
  "application/vnd.airzip.filesecure.azs": ["azs"],
  "application/vnd.amazon.ebook": ["azw"],
  "application/vnd.americandynamics.acc": ["acc"],
  "application/vnd.amiga.ami": ["ami"],
  "application/vnd.android.package-archive": ["apk"],
  "application/vnd.anser-web-certificate-issue-initiation": ["cii"],
  "application/vnd.anser-web-funds-transfer-initiation": ["fti"],
  "application/vnd.antix.game-component": ["atx"],
  "application/vnd.apple.installer+xml": ["mpkg"],
  "application/vnd.apple.keynote": ["key"],
  "application/vnd.apple.mpegurl": ["m3u8"],
  "application/vnd.apple.numbers": ["numbers"],
  "application/vnd.apple.pages": ["pages"],
  "application/vnd.apple.pkpass": ["pkpass"],
  "application/vnd.aristanetworks.swi": ["swi"],
  "application/vnd.astraea-software.iota": ["iota"],
  "application/vnd.audiograph": ["aep"],
  "application/vnd.autodesk.fbx": ["fbx"],
  "application/vnd.balsamiq.bmml+xml": ["bmml"],
  "application/vnd.blueice.multipass": ["mpm"],
  "application/vnd.bmi": ["bmi"],
  "application/vnd.businessobjects": ["rep"],
  "application/vnd.chemdraw+xml": ["cdxml"],
  "application/vnd.chipnuts.karaoke-mmd": ["mmd"],
  "application/vnd.cinderella": ["cdy"],
  "application/vnd.citationstyles.style+xml": ["csl"],
  "application/vnd.claymore": ["cla"],
  "application/vnd.cloanto.rp9": ["rp9"],
  "application/vnd.clonk.c4group": ["c4g", "c4d", "c4f", "c4p", "c4u"],
  "application/vnd.cluetrust.cartomobile-config": ["c11amc"],
  "application/vnd.cluetrust.cartomobile-config-pkg": ["c11amz"],
  "application/vnd.commonspace": ["csp"],
  "application/vnd.contact.cmsg": ["cdbcmsg"],
  "application/vnd.cosmocaller": ["cmc"],
  "application/vnd.crick.clicker": ["clkx"],
  "application/vnd.crick.clicker.keyboard": ["clkk"],
  "application/vnd.crick.clicker.palette": ["clkp"],
  "application/vnd.crick.clicker.template": ["clkt"],
  "application/vnd.crick.clicker.wordbank": ["clkw"],
  "application/vnd.criticaltools.wbs+xml": ["wbs"],
  "application/vnd.ctc-posml": ["pml"],
  "application/vnd.cups-ppd": ["ppd"],
  "application/vnd.curl.car": ["car"],
  "application/vnd.curl.pcurl": ["pcurl"],
  "application/vnd.dart": ["dart"],
  "application/vnd.data-vision.rdz": ["rdz"],
  "application/vnd.dbf": ["dbf"],
  "application/vnd.dcmp+xml": ["dcmp"],
  "application/vnd.dece.data": ["uvf", "uvvf", "uvd", "uvvd"],
  "application/vnd.dece.ttml+xml": ["uvt", "uvvt"],
  "application/vnd.dece.unspecified": ["uvx", "uvvx"],
  "application/vnd.dece.zip": ["uvz", "uvvz"],
  "application/vnd.denovo.fcselayout-link": ["fe_launch"],
  "application/vnd.dna": ["dna"],
  "application/vnd.dolby.mlp": ["mlp"],
  "application/vnd.dpgraph": ["dpg"],
  "application/vnd.dreamfactory": ["dfac"],
  "application/vnd.ds-keypoint": ["kpxx"],
  "application/vnd.dvb.ait": ["ait"],
  "application/vnd.dvb.service": ["svc"],
  "application/vnd.dynageo": ["geo"],
  "application/vnd.ecowin.chart": ["mag"],
  "application/vnd.enliven": ["nml"],
  "application/vnd.epson.esf": ["esf"],
  "application/vnd.epson.msf": ["msf"],
  "application/vnd.epson.quickanime": ["qam"],
  "application/vnd.epson.salt": ["slt"],
  "application/vnd.epson.ssf": ["ssf"],
  "application/vnd.eszigno3+xml": ["es3", "et3"],
  "application/vnd.ezpix-album": ["ez2"],
  "application/vnd.ezpix-package": ["ez3"],
  "application/vnd.fdf": ["*fdf"],
  "application/vnd.fdsn.mseed": ["mseed"],
  "application/vnd.fdsn.seed": ["seed", "dataless"],
  "application/vnd.flographit": ["gph"],
  "application/vnd.fluxtime.clip": ["ftc"],
  "application/vnd.framemaker": ["fm", "frame", "maker", "book"],
  "application/vnd.frogans.fnc": ["fnc"],
  "application/vnd.frogans.ltf": ["ltf"],
  "application/vnd.fsc.weblaunch": ["fsc"],
  "application/vnd.fujitsu.oasys": ["oas"],
  "application/vnd.fujitsu.oasys2": ["oa2"],
  "application/vnd.fujitsu.oasys3": ["oa3"],
  "application/vnd.fujitsu.oasysgp": ["fg5"],
  "application/vnd.fujitsu.oasysprs": ["bh2"],
  "application/vnd.fujixerox.ddd": ["ddd"],
  "application/vnd.fujixerox.docuworks": ["xdw"],
  "application/vnd.fujixerox.docuworks.binder": ["xbd"],
  "application/vnd.fuzzysheet": ["fzs"],
  "application/vnd.genomatix.tuxedo": ["txd"],
  "application/vnd.geogebra.file": ["ggb"],
  "application/vnd.geogebra.slides": ["ggs"],
  "application/vnd.geogebra.tool": ["ggt"],
  "application/vnd.geometry-explorer": ["gex", "gre"],
  "application/vnd.geonext": ["gxt"],
  "application/vnd.geoplan": ["g2w"],
  "application/vnd.geospace": ["g3w"],
  "application/vnd.gmx": ["gmx"],
  "application/vnd.google-apps.document": ["gdoc"],
  "application/vnd.google-apps.drawing": ["gdraw"],
  "application/vnd.google-apps.form": ["gform"],
  "application/vnd.google-apps.jam": ["gjam"],
  "application/vnd.google-apps.map": ["gmap"],
  "application/vnd.google-apps.presentation": ["gslides"],
  "application/vnd.google-apps.script": ["gscript"],
  "application/vnd.google-apps.site": ["gsite"],
  "application/vnd.google-apps.spreadsheet": ["gsheet"],
  "application/vnd.google-earth.kml+xml": ["kml"],
  "application/vnd.google-earth.kmz": ["kmz"],
  "application/vnd.gov.sk.xmldatacontainer+xml": ["xdcf"],
  "application/vnd.grafeq": ["gqf", "gqs"],
  "application/vnd.groove-account": ["gac"],
  "application/vnd.groove-help": ["ghf"],
  "application/vnd.groove-identity-message": ["gim"],
  "application/vnd.groove-injector": ["grv"],
  "application/vnd.groove-tool-message": ["gtm"],
  "application/vnd.groove-tool-template": ["tpl"],
  "application/vnd.groove-vcard": ["vcg"],
  "application/vnd.hal+xml": ["hal"],
  "application/vnd.handheld-entertainment+xml": ["zmm"],
  "application/vnd.hbci": ["hbci"],
  "application/vnd.hhe.lesson-player": ["les"],
  "application/vnd.hp-hpgl": ["hpgl"],
  "application/vnd.hp-hpid": ["hpid"],
  "application/vnd.hp-hps": ["hps"],
  "application/vnd.hp-jlyt": ["jlt"],
  "application/vnd.hp-pcl": ["pcl"],
  "application/vnd.hp-pclxl": ["pclxl"],
  "application/vnd.hydrostatix.sof-data": ["sfd-hdstx"],
  "application/vnd.ibm.minipay": ["mpy"],
  "application/vnd.ibm.modcap": ["afp", "listafp", "list3820"],
  "application/vnd.ibm.rights-management": ["irm"],
  "application/vnd.ibm.secure-container": ["sc"],
  "application/vnd.iccprofile": ["icc", "icm"],
  "application/vnd.igloader": ["igl"],
  "application/vnd.immervision-ivp": ["ivp"],
  "application/vnd.immervision-ivu": ["ivu"],
  "application/vnd.insors.igm": ["igm"],
  "application/vnd.intercon.formnet": ["xpw", "xpx"],
  "application/vnd.intergeo": ["i2g"],
  "application/vnd.intu.qbo": ["qbo"],
  "application/vnd.intu.qfx": ["qfx"],
  "application/vnd.ipunplugged.rcprofile": ["rcprofile"],
  "application/vnd.irepository.package+xml": ["irp"],
  "application/vnd.is-xpr": ["xpr"],
  "application/vnd.isac.fcs": ["fcs"],
  "application/vnd.jam": ["jam"],
  "application/vnd.jcp.javame.midlet-rms": ["rms"],
  "application/vnd.jisp": ["jisp"],
  "application/vnd.joost.joda-archive": ["joda"],
  "application/vnd.kahootz": ["ktz", "ktr"],
  "application/vnd.kde.karbon": ["karbon"],
  "application/vnd.kde.kchart": ["chrt"],
  "application/vnd.kde.kformula": ["kfo"],
  "application/vnd.kde.kivio": ["flw"],
  "application/vnd.kde.kontour": ["kon"],
  "application/vnd.kde.kpresenter": ["kpr", "kpt"],
  "application/vnd.kde.kspread": ["ksp"],
  "application/vnd.kde.kword": ["kwd", "kwt"],
  "application/vnd.kenameaapp": ["htke"],
  "application/vnd.kidspiration": ["kia"],
  "application/vnd.kinar": ["kne", "knp"],
  "application/vnd.koan": ["skp", "skd", "skt", "skm"],
  "application/vnd.kodak-descriptor": ["sse"],
  "application/vnd.las.las+xml": ["lasxml"],
  "application/vnd.llamagraphics.life-balance.desktop": ["lbd"],
  "application/vnd.llamagraphics.life-balance.exchange+xml": ["lbe"],
  "application/vnd.lotus-1-2-3": ["123"],
  "application/vnd.lotus-approach": ["apr"],
  "application/vnd.lotus-freelance": ["pre"],
  "application/vnd.lotus-notes": ["nsf"],
  "application/vnd.lotus-organizer": ["org"],
  "application/vnd.lotus-screencam": ["scm"],
  "application/vnd.lotus-wordpro": ["lwp"],
  "application/vnd.macports.portpkg": ["portpkg"],
  "application/vnd.mapbox-vector-tile": ["mvt"],
  "application/vnd.mcd": ["mcd"],
  "application/vnd.medcalcdata": ["mc1"],
  "application/vnd.mediastation.cdkey": ["cdkey"],
  "application/vnd.mfer": ["mwf"],
  "application/vnd.mfmp": ["mfm"],
  "application/vnd.micrografx.flo": ["flo"],
  "application/vnd.micrografx.igx": ["igx"],
  "application/vnd.mif": ["mif"],
  "application/vnd.mobius.daf": ["daf"],
  "application/vnd.mobius.dis": ["dis"],
  "application/vnd.mobius.mbk": ["mbk"],
  "application/vnd.mobius.mqy": ["mqy"],
  "application/vnd.mobius.msl": ["msl"],
  "application/vnd.mobius.plc": ["plc"],
  "application/vnd.mobius.txf": ["txf"],
  "application/vnd.mophun.application": ["mpn"],
  "application/vnd.mophun.certificate": ["mpc"],
  "application/vnd.mozilla.xul+xml": ["xul"],
  "application/vnd.ms-artgalry": ["cil"],
  "application/vnd.ms-cab-compressed": ["cab"],
  "application/vnd.ms-excel": ["xls", "xlm", "xla", "xlc", "xlt", "xlw"],
  "application/vnd.ms-excel.addin.macroenabled.12": ["xlam"],
  "application/vnd.ms-excel.sheet.binary.macroenabled.12": ["xlsb"],
  "application/vnd.ms-excel.sheet.macroenabled.12": ["xlsm"],
  "application/vnd.ms-excel.template.macroenabled.12": ["xltm"],
  "application/vnd.ms-fontobject": ["eot"],
  "application/vnd.ms-htmlhelp": ["chm"],
  "application/vnd.ms-ims": ["ims"],
  "application/vnd.ms-lrm": ["lrm"],
  "application/vnd.ms-officetheme": ["thmx"],
  "application/vnd.ms-outlook": ["msg"],
  "application/vnd.ms-pki.seccat": ["cat"],
  "application/vnd.ms-pki.stl": ["*stl"],
  "application/vnd.ms-powerpoint": ["ppt", "pps", "pot"],
  "application/vnd.ms-powerpoint.addin.macroenabled.12": ["ppam"],
  "application/vnd.ms-powerpoint.presentation.macroenabled.12": ["pptm"],
  "application/vnd.ms-powerpoint.slide.macroenabled.12": ["sldm"],
  "application/vnd.ms-powerpoint.slideshow.macroenabled.12": ["ppsm"],
  "application/vnd.ms-powerpoint.template.macroenabled.12": ["potm"],
  "application/vnd.ms-project": ["*mpp", "mpt"],
  "application/vnd.ms-visio.viewer": ["vdx"],
  "application/vnd.ms-word.document.macroenabled.12": ["docm"],
  "application/vnd.ms-word.template.macroenabled.12": ["dotm"],
  "application/vnd.ms-works": ["wps", "wks", "wcm", "wdb"],
  "application/vnd.ms-wpl": ["wpl"],
  "application/vnd.ms-xpsdocument": ["xps"],
  "application/vnd.mseq": ["mseq"],
  "application/vnd.musician": ["mus"],
  "application/vnd.muvee.style": ["msty"],
  "application/vnd.mynfc": ["taglet"],
  "application/vnd.nato.bindingdataobject+xml": ["bdo"],
  "application/vnd.neurolanguage.nlu": ["nlu"],
  "application/vnd.nitf": ["ntf", "nitf"],
  "application/vnd.noblenet-directory": ["nnd"],
  "application/vnd.noblenet-sealer": ["nns"],
  "application/vnd.noblenet-web": ["nnw"],
  "application/vnd.nokia.n-gage.ac+xml": ["*ac"],
  "application/vnd.nokia.n-gage.data": ["ngdat"],
  "application/vnd.nokia.n-gage.symbian.install": ["n-gage"],
  "application/vnd.nokia.radio-preset": ["rpst"],
  "application/vnd.nokia.radio-presets": ["rpss"],
  "application/vnd.novadigm.edm": ["edm"],
  "application/vnd.novadigm.edx": ["edx"],
  "application/vnd.novadigm.ext": ["ext"],
  "application/vnd.oasis.opendocument.chart": ["odc"],
  "application/vnd.oasis.opendocument.chart-template": ["otc"],
  "application/vnd.oasis.opendocument.database": ["odb"],
  "application/vnd.oasis.opendocument.formula": ["odf"],
  "application/vnd.oasis.opendocument.formula-template": ["odft"],
  "application/vnd.oasis.opendocument.graphics": ["odg"],
  "application/vnd.oasis.opendocument.graphics-template": ["otg"],
  "application/vnd.oasis.opendocument.image": ["odi"],
  "application/vnd.oasis.opendocument.image-template": ["oti"],
  "application/vnd.oasis.opendocument.presentation": ["odp"],
  "application/vnd.oasis.opendocument.presentation-template": ["otp"],
  "application/vnd.oasis.opendocument.spreadsheet": ["ods"],
  "application/vnd.oasis.opendocument.spreadsheet-template": ["ots"],
  "application/vnd.oasis.opendocument.text": ["odt"],
  "application/vnd.oasis.opendocument.text-master": ["odm"],
  "application/vnd.oasis.opendocument.text-template": ["ott"],
  "application/vnd.oasis.opendocument.text-web": ["oth"],
  "application/vnd.olpc-sugar": ["xo"],
  "application/vnd.oma.dd2+xml": ["dd2"],
  "application/vnd.openblox.game+xml": ["obgx"],
  "application/vnd.openofficeorg.extension": ["oxt"],
  "application/vnd.openstreetmap.data+xml": ["osm"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [
    "pptx"
  ],
  "application/vnd.openxmlformats-officedocument.presentationml.slide": [
    "sldx"
  ],
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow": [
    "ppsx"
  ],
  "application/vnd.openxmlformats-officedocument.presentationml.template": [
    "potx"
  ],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template": [
    "xltx"
  ],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    "docx"
  ],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template": [
    "dotx"
  ],
  "application/vnd.osgeo.mapguide.package": ["mgp"],
  "application/vnd.osgi.dp": ["dp"],
  "application/vnd.osgi.subsystem": ["esa"],
  "application/vnd.palm": ["pdb", "pqa", "oprc"],
  "application/vnd.pawaafile": ["paw"],
  "application/vnd.pg.format": ["str"],
  "application/vnd.pg.osasli": ["ei6"],
  "application/vnd.picsel": ["efif"],
  "application/vnd.pmi.widget": ["wg"],
  "application/vnd.pocketlearn": ["plf"],
  "application/vnd.powerbuilder6": ["pbd"],
  "application/vnd.previewsystems.box": ["box"],
  "application/vnd.procrate.brushset": ["brushset"],
  "application/vnd.procreate.brush": ["brush"],
  "application/vnd.procreate.dream": ["drm"],
  "application/vnd.proteus.magazine": ["mgz"],
  "application/vnd.publishare-delta-tree": ["qps"],
  "application/vnd.pvi.ptid1": ["ptid"],
  "application/vnd.pwg-xhtml-print+xml": ["xhtm"],
  "application/vnd.quark.quarkxpress": [
    "qxd",
    "qxt",
    "qwd",
    "qwt",
    "qxl",
    "qxb"
  ],
  "application/vnd.rar": ["rar"],
  "application/vnd.realvnc.bed": ["bed"],
  "application/vnd.recordare.musicxml": ["mxl"],
  "application/vnd.recordare.musicxml+xml": ["musicxml"],
  "application/vnd.rig.cryptonote": ["cryptonote"],
  "application/vnd.rim.cod": ["cod"],
  "application/vnd.rn-realmedia": ["rm"],
  "application/vnd.rn-realmedia-vbr": ["rmvb"],
  "application/vnd.route66.link66+xml": ["link66"],
  "application/vnd.sailingtracker.track": ["st"],
  "application/vnd.seemail": ["see"],
  "application/vnd.sema": ["sema"],
  "application/vnd.semd": ["semd"],
  "application/vnd.semf": ["semf"],
  "application/vnd.shana.informed.formdata": ["ifm"],
  "application/vnd.shana.informed.formtemplate": ["itp"],
  "application/vnd.shana.informed.interchange": ["iif"],
  "application/vnd.shana.informed.package": ["ipk"],
  "application/vnd.simtech-mindmapper": ["twd", "twds"],
  "application/vnd.smaf": ["mmf"],
  "application/vnd.smart.teacher": ["teacher"],
  "application/vnd.software602.filler.form+xml": ["fo"],
  "application/vnd.solent.sdkm+xml": ["sdkm", "sdkd"],
  "application/vnd.spotfire.dxp": ["dxp"],
  "application/vnd.spotfire.sfs": ["sfs"],
  "application/vnd.stardivision.calc": ["sdc"],
  "application/vnd.stardivision.draw": ["sda"],
  "application/vnd.stardivision.impress": ["sdd"],
  "application/vnd.stardivision.math": ["smf"],
  "application/vnd.stardivision.writer": ["sdw", "vor"],
  "application/vnd.stardivision.writer-global": ["sgl"],
  "application/vnd.stepmania.package": ["smzip"],
  "application/vnd.stepmania.stepchart": ["sm"],
  "application/vnd.sun.wadl+xml": ["wadl"],
  "application/vnd.sun.xml.calc": ["sxc"],
  "application/vnd.sun.xml.calc.template": ["stc"],
  "application/vnd.sun.xml.draw": ["sxd"],
  "application/vnd.sun.xml.draw.template": ["std"],
  "application/vnd.sun.xml.impress": ["sxi"],
  "application/vnd.sun.xml.impress.template": ["sti"],
  "application/vnd.sun.xml.math": ["sxm"],
  "application/vnd.sun.xml.writer": ["sxw"],
  "application/vnd.sun.xml.writer.global": ["sxg"],
  "application/vnd.sun.xml.writer.template": ["stw"],
  "application/vnd.sus-calendar": ["sus", "susp"],
  "application/vnd.svd": ["svd"],
  "application/vnd.symbian.install": ["sis", "sisx"],
  "application/vnd.syncml+xml": ["xsm"],
  "application/vnd.syncml.dm+wbxml": ["bdm"],
  "application/vnd.syncml.dm+xml": ["xdm"],
  "application/vnd.syncml.dmddf+xml": ["ddf"],
  "application/vnd.tao.intent-module-archive": ["tao"],
  "application/vnd.tcpdump.pcap": ["pcap", "cap", "dmp"],
  "application/vnd.tmobile-livetv": ["tmo"],
  "application/vnd.trid.tpt": ["tpt"],
  "application/vnd.triscape.mxs": ["mxs"],
  "application/vnd.trueapp": ["tra"],
  "application/vnd.ufdl": ["ufd", "ufdl"],
  "application/vnd.uiq.theme": ["utz"],
  "application/vnd.umajin": ["umj"],
  "application/vnd.unity": ["unityweb"],
  "application/vnd.uoml+xml": ["uoml", "uo"],
  "application/vnd.vcx": ["vcx"],
  "application/vnd.visio": ["vsd", "vst", "vss", "vsw", "vsdx", "vtx"],
  "application/vnd.visionary": ["vis"],
  "application/vnd.vsf": ["vsf"],
  "application/vnd.wap.wbxml": ["wbxml"],
  "application/vnd.wap.wmlc": ["wmlc"],
  "application/vnd.wap.wmlscriptc": ["wmlsc"],
  "application/vnd.webturbo": ["wtb"],
  "application/vnd.wolfram.player": ["nbp"],
  "application/vnd.wordperfect": ["wpd"],
  "application/vnd.wqd": ["wqd"],
  "application/vnd.wt.stf": ["stf"],
  "application/vnd.xara": ["xar"],
  "application/vnd.xfdl": ["xfdl"],
  "application/vnd.yamaha.hv-dic": ["hvd"],
  "application/vnd.yamaha.hv-script": ["hvs"],
  "application/vnd.yamaha.hv-voice": ["hvp"],
  "application/vnd.yamaha.openscoreformat": ["osf"],
  "application/vnd.yamaha.openscoreformat.osfpvg+xml": ["osfpvg"],
  "application/vnd.yamaha.smaf-audio": ["saf"],
  "application/vnd.yamaha.smaf-phrase": ["spf"],
  "application/vnd.yellowriver-custom-menu": ["cmp"],
  "application/vnd.zul": ["zir", "zirz"],
  "application/vnd.zzazz.deck+xml": ["zaz"],
  "application/x-7z-compressed": ["7z"],
  "application/x-abiword": ["abw"],
  "application/x-ace-compressed": ["ace"],
  "application/x-apple-diskimage": ["*dmg"],
  "application/x-arj": ["arj"],
  "application/x-authorware-bin": ["aab", "x32", "u32", "vox"],
  "application/x-authorware-map": ["aam"],
  "application/x-authorware-seg": ["aas"],
  "application/x-bcpio": ["bcpio"],
  "application/x-bdoc": ["*bdoc"],
  "application/x-bittorrent": ["torrent"],
  "application/x-blender": ["blend"],
  "application/x-blorb": ["blb", "blorb"],
  "application/x-bzip": ["bz"],
  "application/x-bzip2": ["bz2", "boz"],
  "application/x-cbr": ["cbr", "cba", "cbt", "cbz", "cb7"],
  "application/x-cdlink": ["vcd"],
  "application/x-cfs-compressed": ["cfs"],
  "application/x-chat": ["chat"],
  "application/x-chess-pgn": ["pgn"],
  "application/x-chrome-extension": ["crx"],
  "application/x-cocoa": ["cco"],
  "application/x-compressed": ["*rar"],
  "application/x-conference": ["nsc"],
  "application/x-cpio": ["cpio"],
  "application/x-csh": ["csh"],
  "application/x-debian-package": ["*deb", "udeb"],
  "application/x-dgc-compressed": ["dgc"],
  "application/x-director": [
    "dir",
    "dcr",
    "dxr",
    "cst",
    "cct",
    "cxt",
    "w3d",
    "fgd",
    "swa"
  ],
  "application/x-doom": ["wad"],
  "application/x-dtbncx+xml": ["ncx"],
  "application/x-dtbook+xml": ["dtb"],
  "application/x-dtbresource+xml": ["res"],
  "application/x-dvi": ["dvi"],
  "application/x-envoy": ["evy"],
  "application/x-eva": ["eva"],
  "application/x-font-bdf": ["bdf"],
  "application/x-font-ghostscript": ["gsf"],
  "application/x-font-linux-psf": ["psf"],
  "application/x-font-pcf": ["pcf"],
  "application/x-font-snf": ["snf"],
  "application/x-font-type1": ["pfa", "pfb", "pfm", "afm"],
  "application/x-freearc": ["arc"],
  "application/x-futuresplash": ["spl"],
  "application/x-gca-compressed": ["gca"],
  "application/x-glulx": ["ulx"],
  "application/x-gnumeric": ["gnumeric"],
  "application/x-gramps-xml": ["gramps"],
  "application/x-gtar": ["gtar"],
  "application/x-hdf": ["hdf"],
  "application/x-httpd-php": ["php"],
  "application/x-install-instructions": ["install"],
  "application/x-ipynb+json": ["ipynb"],
  "application/x-iso9660-image": ["*iso"],
  "application/x-iwork-keynote-sffkey": ["*key"],
  "application/x-iwork-numbers-sffnumbers": ["*numbers"],
  "application/x-iwork-pages-sffpages": ["*pages"],
  "application/x-java-archive-diff": ["jardiff"],
  "application/x-java-jnlp-file": ["jnlp"],
  "application/x-keepass2": ["kdbx"],
  "application/x-latex": ["latex"],
  "application/x-lua-bytecode": ["luac"],
  "application/x-lzh-compressed": ["lzh", "lha"],
  "application/x-makeself": ["run"],
  "application/x-mie": ["mie"],
  "application/x-mobipocket-ebook": ["*prc", "mobi"],
  "application/x-ms-application": ["application"],
  "application/x-ms-shortcut": ["lnk"],
  "application/x-ms-wmd": ["wmd"],
  "application/x-ms-wmz": ["wmz"],
  "application/x-ms-xbap": ["xbap"],
  "application/x-msaccess": ["mdb"],
  "application/x-msbinder": ["obd"],
  "application/x-mscardfile": ["crd"],
  "application/x-msclip": ["clp"],
  "application/x-msdos-program": ["*exe"],
  "application/x-msdownload": ["*exe", "*dll", "com", "bat", "*msi"],
  "application/x-msmediaview": ["mvb", "m13", "m14"],
  "application/x-msmetafile": ["*wmf", "*wmz", "*emf", "emz"],
  "application/x-msmoney": ["mny"],
  "application/x-mspublisher": ["pub"],
  "application/x-msschedule": ["scd"],
  "application/x-msterminal": ["trm"],
  "application/x-mswrite": ["wri"],
  "application/x-netcdf": ["nc", "cdf"],
  "application/x-ns-proxy-autoconfig": ["pac"],
  "application/x-nzb": ["nzb"],
  "application/x-perl": ["pl", "pm"],
  "application/x-pilot": ["*prc", "*pdb"],
  "application/x-pkcs12": ["p12", "pfx"],
  "application/x-pkcs7-certificates": ["p7b", "spc"],
  "application/x-pkcs7-certreqresp": ["p7r"],
  "application/x-rar-compressed": ["*rar"],
  "application/x-redhat-package-manager": ["rpm"],
  "application/x-research-info-systems": ["ris"],
  "application/x-sea": ["sea"],
  "application/x-sh": ["sh"],
  "application/x-shar": ["shar"],
  "application/x-shockwave-flash": ["swf"],
  "application/x-silverlight-app": ["xap"],
  "application/x-sql": ["*sql"],
  "application/x-stuffit": ["sit"],
  "application/x-stuffitx": ["sitx"],
  "application/x-subrip": ["srt"],
  "application/x-sv4cpio": ["sv4cpio"],
  "application/x-sv4crc": ["sv4crc"],
  "application/x-t3vm-image": ["t3"],
  "application/x-tads": ["gam"],
  "application/x-tar": ["tar"],
  "application/x-tcl": ["tcl", "tk"],
  "application/x-tex": ["tex"],
  "application/x-tex-tfm": ["tfm"],
  "application/x-texinfo": ["texinfo", "texi"],
  "application/x-tgif": ["*obj"],
  "application/x-ustar": ["ustar"],
  "application/x-virtualbox-hdd": ["hdd"],
  "application/x-virtualbox-ova": ["ova"],
  "application/x-virtualbox-ovf": ["ovf"],
  "application/x-virtualbox-vbox": ["vbox"],
  "application/x-virtualbox-vbox-extpack": ["vbox-extpack"],
  "application/x-virtualbox-vdi": ["vdi"],
  "application/x-virtualbox-vhd": ["vhd"],
  "application/x-virtualbox-vmdk": ["vmdk"],
  "application/x-wais-source": ["src"],
  "application/x-web-app-manifest+json": ["webapp"],
  "application/x-x509-ca-cert": ["der", "crt", "pem"],
  "application/x-xfig": ["fig"],
  "application/x-xliff+xml": ["*xlf"],
  "application/x-xpinstall": ["xpi"],
  "application/x-xz": ["xz"],
  "application/x-zip-compressed": ["*zip"],
  "application/x-zmachine": ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"],
  "audio/vnd.dece.audio": ["uva", "uvva"],
  "audio/vnd.digital-winds": ["eol"],
  "audio/vnd.dra": ["dra"],
  "audio/vnd.dts": ["dts"],
  "audio/vnd.dts.hd": ["dtshd"],
  "audio/vnd.lucent.voice": ["lvp"],
  "audio/vnd.ms-playready.media.pya": ["pya"],
  "audio/vnd.nuera.ecelp4800": ["ecelp4800"],
  "audio/vnd.nuera.ecelp7470": ["ecelp7470"],
  "audio/vnd.nuera.ecelp9600": ["ecelp9600"],
  "audio/vnd.rip": ["rip"],
  "audio/x-aac": ["*aac"],
  "audio/x-aiff": ["aif", "aiff", "aifc"],
  "audio/x-caf": ["caf"],
  "audio/x-flac": ["flac"],
  "audio/x-m4a": ["*m4a"],
  "audio/x-matroska": ["mka"],
  "audio/x-mpegurl": ["m3u"],
  "audio/x-ms-wax": ["wax"],
  "audio/x-ms-wma": ["wma"],
  "audio/x-pn-realaudio": ["ram", "ra"],
  "audio/x-pn-realaudio-plugin": ["rmp"],
  "audio/x-realaudio": ["*ra"],
  "audio/x-wav": ["*wav"],
  "chemical/x-cdx": ["cdx"],
  "chemical/x-cif": ["cif"],
  "chemical/x-cmdf": ["cmdf"],
  "chemical/x-cml": ["cml"],
  "chemical/x-csml": ["csml"],
  "chemical/x-xyz": ["xyz"],
  "image/prs.btif": ["btif", "btf"],
  "image/prs.pti": ["pti"],
  "image/vnd.adobe.photoshop": ["psd"],
  "image/vnd.airzip.accelerator.azv": ["azv"],
  "image/vnd.blockfact.facti": ["facti"],
  "image/vnd.dece.graphic": ["uvi", "uvvi", "uvg", "uvvg"],
  "image/vnd.djvu": ["djvu", "djv"],
  "image/vnd.dvb.subtitle": ["*sub"],
  "image/vnd.dwg": ["dwg"],
  "image/vnd.dxf": ["dxf"],
  "image/vnd.fastbidsheet": ["fbs"],
  "image/vnd.fpx": ["fpx"],
  "image/vnd.fst": ["fst"],
  "image/vnd.fujixerox.edmics-mmr": ["mmr"],
  "image/vnd.fujixerox.edmics-rlc": ["rlc"],
  "image/vnd.microsoft.icon": ["ico"],
  "image/vnd.ms-dds": ["dds"],
  "image/vnd.ms-modi": ["mdi"],
  "image/vnd.ms-photo": ["wdp"],
  "image/vnd.net-fpx": ["npx"],
  "image/vnd.pco.b16": ["b16"],
  "image/vnd.tencent.tap": ["tap"],
  "image/vnd.valve.source.texture": ["vtf"],
  "image/vnd.wap.wbmp": ["wbmp"],
  "image/vnd.xiff": ["xif"],
  "image/vnd.zbrush.pcx": ["pcx"],
  "image/x-3ds": ["3ds"],
  "image/x-adobe-dng": ["dng"],
  "image/x-cmu-raster": ["ras"],
  "image/x-cmx": ["cmx"],
  "image/x-freehand": ["fh", "fhc", "fh4", "fh5", "fh7"],
  "image/x-icon": ["*ico"],
  "image/x-jng": ["jng"],
  "image/x-mrsid-image": ["sid"],
  "image/x-ms-bmp": ["*bmp"],
  "image/x-pcx": ["*pcx"],
  "image/x-pict": ["pic", "pct"],
  "image/x-portable-anymap": ["pnm"],
  "image/x-portable-bitmap": ["pbm"],
  "image/x-portable-graymap": ["pgm"],
  "image/x-portable-pixmap": ["ppm"],
  "image/x-rgb": ["rgb"],
  "image/x-tga": ["tga"],
  "image/x-xbitmap": ["xbm"],
  "image/x-xpixmap": ["xpm"],
  "image/x-xwindowdump": ["xwd"],
  "message/vnd.wfa.wsc": ["wsc"],
  "model/vnd.bary": ["bary"],
  "model/vnd.cld": ["cld"],
  "model/vnd.collada+xml": ["dae"],
  "model/vnd.dwf": ["dwf"],
  "model/vnd.gdl": ["gdl"],
  "model/vnd.gtw": ["gtw"],
  "model/vnd.mts": ["*mts"],
  "model/vnd.opengex": ["ogex"],
  "model/vnd.parasolid.transmit.binary": ["x_b"],
  "model/vnd.parasolid.transmit.text": ["x_t"],
  "model/vnd.pytha.pyox": ["pyo", "pyox"],
  "model/vnd.sap.vds": ["vds"],
  "model/vnd.usda": ["usda"],
  "model/vnd.usdz+zip": ["usdz"],
  "model/vnd.valve.source.compiled-map": ["bsp"],
  "model/vnd.vtu": ["vtu"],
  "text/prs.lines.tag": ["dsc"],
  "text/vnd.curl": ["curl"],
  "text/vnd.curl.dcurl": ["dcurl"],
  "text/vnd.curl.mcurl": ["mcurl"],
  "text/vnd.curl.scurl": ["scurl"],
  "text/vnd.dvb.subtitle": ["sub"],
  "text/vnd.familysearch.gedcom": ["ged"],
  "text/vnd.fly": ["fly"],
  "text/vnd.fmi.flexstor": ["flx"],
  "text/vnd.graphviz": ["gv"],
  "text/vnd.in3d.3dml": ["3dml"],
  "text/vnd.in3d.spot": ["spot"],
  "text/vnd.sun.j2me.app-descriptor": ["jad"],
  "text/vnd.wap.wml": ["wml"],
  "text/vnd.wap.wmlscript": ["wmls"],
  "text/x-asm": ["s", "asm"],
  "text/x-c": ["c", "cc", "cxx", "cpp", "h", "hh", "dic"],
  "text/x-component": ["htc"],
  "text/x-fortran": ["f", "for", "f77", "f90"],
  "text/x-handlebars-template": ["hbs"],
  "text/x-java-source": ["java"],
  "text/x-lua": ["lua"],
  "text/x-markdown": ["mkd"],
  "text/x-nfo": ["nfo"],
  "text/x-opml": ["opml"],
  "text/x-org": ["*org"],
  "text/x-pascal": ["p", "pas"],
  "text/x-processing": ["pde"],
  "text/x-sass": ["sass"],
  "text/x-scss": ["scss"],
  "text/x-setext": ["etx"],
  "text/x-sfv": ["sfv"],
  "text/x-suse-ymp": ["ymp"],
  "text/x-uuencode": ["uu"],
  "text/x-vcalendar": ["vcs"],
  "text/x-vcard": ["vcf"],
  "video/vnd.dece.hd": ["uvh", "uvvh"],
  "video/vnd.dece.mobile": ["uvm", "uvvm"],
  "video/vnd.dece.pd": ["uvp", "uvvp"],
  "video/vnd.dece.sd": ["uvs", "uvvs"],
  "video/vnd.dece.video": ["uvv", "uvvv"],
  "video/vnd.dvb.file": ["dvb"],
  "video/vnd.fvt": ["fvt"],
  "video/vnd.mpegurl": ["mxu", "m4u"],
  "video/vnd.ms-playready.media.pyv": ["pyv"],
  "video/vnd.uvvu.mp4": ["uvu", "uvvu"],
  "video/vnd.vivo": ["viv"],
  "video/x-f4v": ["f4v"],
  "video/x-fli": ["fli"],
  "video/x-flv": ["flv"],
  "video/x-m4v": ["m4v"],
  "video/x-matroska": ["mkv", "mk3d", "mks"],
  "video/x-mng": ["mng"],
  "video/x-ms-asf": ["asf", "asx"],
  "video/x-ms-vob": ["vob"],
  "video/x-ms-wm": ["wm"],
  "video/x-ms-wmv": ["wmv"],
  "video/x-ms-wmx": ["wmx"],
  "video/x-ms-wvx": ["wvx"],
  "video/x-msvideo": ["avi"],
  "video/x-sgi-movie": ["movie"],
  "video/x-smv": ["smv"],
  "x-conference/x-cooltalk": ["ice"]
};
Object.freeze(types);
var other_default = types;

// node_modules/mime/dist/types/standard.js
var types2 = {
  "application/andrew-inset": ["ez"],
  "application/appinstaller": ["appinstaller"],
  "application/applixware": ["aw"],
  "application/appx": ["appx"],
  "application/appxbundle": ["appxbundle"],
  "application/atom+xml": ["atom"],
  "application/atomcat+xml": ["atomcat"],
  "application/atomdeleted+xml": ["atomdeleted"],
  "application/atomsvc+xml": ["atomsvc"],
  "application/atsc-dwd+xml": ["dwd"],
  "application/atsc-held+xml": ["held"],
  "application/atsc-rsat+xml": ["rsat"],
  "application/automationml-aml+xml": ["aml"],
  "application/automationml-amlx+zip": ["amlx"],
  "application/bdoc": ["bdoc"],
  "application/calendar+xml": ["xcs"],
  "application/ccxml+xml": ["ccxml"],
  "application/cdfx+xml": ["cdfx"],
  "application/cdmi-capability": ["cdmia"],
  "application/cdmi-container": ["cdmic"],
  "application/cdmi-domain": ["cdmid"],
  "application/cdmi-object": ["cdmio"],
  "application/cdmi-queue": ["cdmiq"],
  "application/cpl+xml": ["cpl"],
  "application/cu-seeme": ["cu"],
  "application/cwl": ["cwl"],
  "application/dash+xml": ["mpd"],
  "application/dash-patch+xml": ["mpp"],
  "application/davmount+xml": ["davmount"],
  "application/dicom": ["dcm"],
  "application/docbook+xml": ["dbk"],
  "application/dssc+der": ["dssc"],
  "application/dssc+xml": ["xdssc"],
  "application/ecmascript": ["ecma"],
  "application/emma+xml": ["emma"],
  "application/emotionml+xml": ["emotionml"],
  "application/epub+zip": ["epub"],
  "application/exi": ["exi"],
  "application/express": ["exp"],
  "application/fdf": ["fdf"],
  "application/fdt+xml": ["fdt"],
  "application/font-tdpfr": ["pfr"],
  "application/geo+json": ["geojson"],
  "application/gml+xml": ["gml"],
  "application/gpx+xml": ["gpx"],
  "application/gxf": ["gxf"],
  "application/gzip": ["gz"],
  "application/hjson": ["hjson"],
  "application/hyperstudio": ["stk"],
  "application/inkml+xml": ["ink", "inkml"],
  "application/ipfix": ["ipfix"],
  "application/its+xml": ["its"],
  "application/java-archive": ["jar", "war", "ear"],
  "application/java-serialized-object": ["ser"],
  "application/java-vm": ["class"],
  "application/javascript": ["*js"],
  "application/json": ["json", "map"],
  "application/json5": ["json5"],
  "application/jsonml+json": ["jsonml"],
  "application/ld+json": ["jsonld"],
  "application/lgr+xml": ["lgr"],
  "application/lost+xml": ["lostxml"],
  "application/mac-binhex40": ["hqx"],
  "application/mac-compactpro": ["cpt"],
  "application/mads+xml": ["mads"],
  "application/manifest+json": ["webmanifest"],
  "application/marc": ["mrc"],
  "application/marcxml+xml": ["mrcx"],
  "application/mathematica": ["ma", "nb", "mb"],
  "application/mathml+xml": ["mathml"],
  "application/mbox": ["mbox"],
  "application/media-policy-dataset+xml": ["mpf"],
  "application/mediaservercontrol+xml": ["mscml"],
  "application/metalink+xml": ["metalink"],
  "application/metalink4+xml": ["meta4"],
  "application/mets+xml": ["mets"],
  "application/mmt-aei+xml": ["maei"],
  "application/mmt-usd+xml": ["musd"],
  "application/mods+xml": ["mods"],
  "application/mp21": ["m21", "mp21"],
  "application/mp4": ["*mp4", "*mpg4", "mp4s", "m4p"],
  "application/msix": ["msix"],
  "application/msixbundle": ["msixbundle"],
  "application/msword": ["doc", "dot"],
  "application/mxf": ["mxf"],
  "application/n-quads": ["nq"],
  "application/n-triples": ["nt"],
  "application/node": ["cjs"],
  "application/octet-stream": [
    "bin",
    "dms",
    "lrf",
    "mar",
    "so",
    "dist",
    "distz",
    "pkg",
    "bpk",
    "dump",
    "elc",
    "deploy",
    "exe",
    "dll",
    "deb",
    "dmg",
    "iso",
    "img",
    "msi",
    "msp",
    "msm",
    "buffer"
  ],
  "application/oda": ["oda"],
  "application/oebps-package+xml": ["opf"],
  "application/ogg": ["ogx"],
  "application/omdoc+xml": ["omdoc"],
  "application/onenote": [
    "onetoc",
    "onetoc2",
    "onetmp",
    "onepkg",
    "one",
    "onea"
  ],
  "application/oxps": ["oxps"],
  "application/p2p-overlay+xml": ["relo"],
  "application/patch-ops-error+xml": ["xer"],
  "application/pdf": ["pdf"],
  "application/pgp-encrypted": ["pgp"],
  "application/pgp-keys": ["asc"],
  "application/pgp-signature": ["sig", "*asc"],
  "application/pics-rules": ["prf"],
  "application/pkcs10": ["p10"],
  "application/pkcs7-mime": ["p7m", "p7c"],
  "application/pkcs7-signature": ["p7s"],
  "application/pkcs8": ["p8"],
  "application/pkix-attr-cert": ["ac"],
  "application/pkix-cert": ["cer"],
  "application/pkix-crl": ["crl"],
  "application/pkix-pkipath": ["pkipath"],
  "application/pkixcmp": ["pki"],
  "application/pls+xml": ["pls"],
  "application/postscript": ["ai", "eps", "ps"],
  "application/provenance+xml": ["provx"],
  "application/pskc+xml": ["pskcxml"],
  "application/raml+yaml": ["raml"],
  "application/rdf+xml": ["rdf", "owl"],
  "application/reginfo+xml": ["rif"],
  "application/relax-ng-compact-syntax": ["rnc"],
  "application/resource-lists+xml": ["rl"],
  "application/resource-lists-diff+xml": ["rld"],
  "application/rls-services+xml": ["rs"],
  "application/route-apd+xml": ["rapd"],
  "application/route-s-tsid+xml": ["sls"],
  "application/route-usd+xml": ["rusd"],
  "application/rpki-ghostbusters": ["gbr"],
  "application/rpki-manifest": ["mft"],
  "application/rpki-roa": ["roa"],
  "application/rsd+xml": ["rsd"],
  "application/rss+xml": ["rss"],
  "application/rtf": ["rtf"],
  "application/sbml+xml": ["sbml"],
  "application/scvp-cv-request": ["scq"],
  "application/scvp-cv-response": ["scs"],
  "application/scvp-vp-request": ["spq"],
  "application/scvp-vp-response": ["spp"],
  "application/sdp": ["sdp"],
  "application/senml+xml": ["senmlx"],
  "application/sensml+xml": ["sensmlx"],
  "application/set-payment-initiation": ["setpay"],
  "application/set-registration-initiation": ["setreg"],
  "application/shf+xml": ["shf"],
  "application/sieve": ["siv", "sieve"],
  "application/smil+xml": ["smi", "smil"],
  "application/sparql-query": ["rq"],
  "application/sparql-results+xml": ["srx"],
  "application/sql": ["sql"],
  "application/srgs": ["gram"],
  "application/srgs+xml": ["grxml"],
  "application/sru+xml": ["sru"],
  "application/ssdl+xml": ["ssdl"],
  "application/ssml+xml": ["ssml"],
  "application/swid+xml": ["swidtag"],
  "application/tei+xml": ["tei", "teicorpus"],
  "application/thraud+xml": ["tfi"],
  "application/timestamped-data": ["tsd"],
  "application/toml": ["toml"],
  "application/trig": ["trig"],
  "application/ttml+xml": ["ttml"],
  "application/ubjson": ["ubj"],
  "application/urc-ressheet+xml": ["rsheet"],
  "application/urc-targetdesc+xml": ["td"],
  "application/voicexml+xml": ["vxml"],
  "application/wasm": ["wasm"],
  "application/watcherinfo+xml": ["wif"],
  "application/widget": ["wgt"],
  "application/winhlp": ["hlp"],
  "application/wsdl+xml": ["wsdl"],
  "application/wspolicy+xml": ["wspolicy"],
  "application/xaml+xml": ["xaml"],
  "application/xcap-att+xml": ["xav"],
  "application/xcap-caps+xml": ["xca"],
  "application/xcap-diff+xml": ["xdf"],
  "application/xcap-el+xml": ["xel"],
  "application/xcap-ns+xml": ["xns"],
  "application/xenc+xml": ["xenc"],
  "application/xfdf": ["xfdf"],
  "application/xhtml+xml": ["xhtml", "xht"],
  "application/xliff+xml": ["xlf"],
  "application/xml": ["xml", "xsl", "xsd", "rng"],
  "application/xml-dtd": ["dtd"],
  "application/xop+xml": ["xop"],
  "application/xproc+xml": ["xpl"],
  "application/xslt+xml": ["*xsl", "xslt"],
  "application/xspf+xml": ["xspf"],
  "application/xv+xml": ["mxml", "xhvml", "xvml", "xvm"],
  "application/yang": ["yang"],
  "application/yin+xml": ["yin"],
  "application/zip": ["zip"],
  "application/zip+dotlottie": ["lottie"],
  "audio/3gpp": ["*3gpp"],
  "audio/aac": ["adts", "aac"],
  "audio/adpcm": ["adp"],
  "audio/amr": ["amr"],
  "audio/basic": ["au", "snd"],
  "audio/midi": ["mid", "midi", "kar", "rmi"],
  "audio/mobile-xmf": ["mxmf"],
  "audio/mp3": ["*mp3"],
  "audio/mp4": ["m4a", "mp4a", "m4b"],
  "audio/mpeg": ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"],
  "audio/ogg": ["oga", "ogg", "spx", "opus"],
  "audio/s3m": ["s3m"],
  "audio/silk": ["sil"],
  "audio/wav": ["wav"],
  "audio/wave": ["*wav"],
  "audio/webm": ["weba"],
  "audio/xm": ["xm"],
  "font/collection": ["ttc"],
  "font/otf": ["otf"],
  "font/ttf": ["ttf"],
  "font/woff": ["woff"],
  "font/woff2": ["woff2"],
  "image/aces": ["exr"],
  "image/apng": ["apng"],
  "image/avci": ["avci"],
  "image/avcs": ["avcs"],
  "image/avif": ["avif"],
  "image/bmp": ["bmp", "dib"],
  "image/cgm": ["cgm"],
  "image/dicom-rle": ["drle"],
  "image/dpx": ["dpx"],
  "image/emf": ["emf"],
  "image/fits": ["fits"],
  "image/g3fax": ["g3"],
  "image/gif": ["gif"],
  "image/heic": ["heic"],
  "image/heic-sequence": ["heics"],
  "image/heif": ["heif"],
  "image/heif-sequence": ["heifs"],
  "image/hej2k": ["hej2"],
  "image/ief": ["ief"],
  "image/jaii": ["jaii"],
  "image/jais": ["jais"],
  "image/jls": ["jls"],
  "image/jp2": ["jp2", "jpg2"],
  "image/jpeg": ["jpg", "jpeg", "jpe"],
  "image/jph": ["jph"],
  "image/jphc": ["jhc"],
  "image/jpm": ["jpm", "jpgm"],
  "image/jpx": ["jpx", "jpf"],
  "image/jxl": ["jxl"],
  "image/jxr": ["jxr"],
  "image/jxra": ["jxra"],
  "image/jxrs": ["jxrs"],
  "image/jxs": ["jxs"],
  "image/jxsc": ["jxsc"],
  "image/jxsi": ["jxsi"],
  "image/jxss": ["jxss"],
  "image/ktx": ["ktx"],
  "image/ktx2": ["ktx2"],
  "image/pjpeg": ["jfif"],
  "image/png": ["png"],
  "image/sgi": ["sgi"],
  "image/svg+xml": ["svg", "svgz"],
  "image/t38": ["t38"],
  "image/tiff": ["tif", "tiff"],
  "image/tiff-fx": ["tfx"],
  "image/webp": ["webp"],
  "image/wmf": ["wmf"],
  "message/disposition-notification": ["disposition-notification"],
  "message/global": ["u8msg"],
  "message/global-delivery-status": ["u8dsn"],
  "message/global-disposition-notification": ["u8mdn"],
  "message/global-headers": ["u8hdr"],
  "message/rfc822": ["eml", "mime", "mht", "mhtml"],
  "model/3mf": ["3mf"],
  "model/gltf+json": ["gltf"],
  "model/gltf-binary": ["glb"],
  "model/iges": ["igs", "iges"],
  "model/jt": ["jt"],
  "model/mesh": ["msh", "mesh", "silo"],
  "model/mtl": ["mtl"],
  "model/obj": ["obj"],
  "model/prc": ["prc"],
  "model/step": ["step", "stp", "stpnc", "p21", "210"],
  "model/step+xml": ["stpx"],
  "model/step+zip": ["stpz"],
  "model/step-xml+zip": ["stpxz"],
  "model/stl": ["stl"],
  "model/u3d": ["u3d"],
  "model/vrml": ["wrl", "vrml"],
  "model/x3d+binary": ["*x3db", "x3dbz"],
  "model/x3d+fastinfoset": ["x3db"],
  "model/x3d+vrml": ["*x3dv", "x3dvz"],
  "model/x3d+xml": ["x3d", "x3dz"],
  "model/x3d-vrml": ["x3dv"],
  "text/cache-manifest": ["appcache", "manifest"],
  "text/calendar": ["ics", "ifb"],
  "text/coffeescript": ["coffee", "litcoffee"],
  "text/css": ["css"],
  "text/csv": ["csv"],
  "text/html": ["html", "htm", "shtml"],
  "text/jade": ["jade"],
  "text/javascript": ["js", "mjs"],
  "text/jsx": ["jsx"],
  "text/less": ["less"],
  "text/markdown": ["md", "markdown"],
  "text/mathml": ["mml"],
  "text/mdx": ["mdx"],
  "text/n3": ["n3"],
  "text/plain": ["txt", "text", "conf", "def", "list", "log", "in", "ini"],
  "text/richtext": ["rtx"],
  "text/rtf": ["*rtf"],
  "text/sgml": ["sgml", "sgm"],
  "text/shex": ["shex"],
  "text/slim": ["slim", "slm"],
  "text/spdx": ["spdx"],
  "text/stylus": ["stylus", "styl"],
  "text/tab-separated-values": ["tsv"],
  "text/troff": ["t", "tr", "roff", "man", "me", "ms"],
  "text/turtle": ["ttl"],
  "text/uri-list": ["uri", "uris", "urls"],
  "text/vcard": ["vcard"],
  "text/vtt": ["vtt"],
  "text/wgsl": ["wgsl"],
  "text/xml": ["*xml"],
  "text/yaml": ["yaml", "yml"],
  "video/3gpp": ["3gp", "3gpp"],
  "video/3gpp2": ["3g2"],
  "video/h261": ["h261"],
  "video/h263": ["h263"],
  "video/h264": ["h264"],
  "video/iso.segment": ["m4s"],
  "video/jpeg": ["jpgv"],
  "video/jpm": ["*jpm", "*jpgm"],
  "video/mj2": ["mj2", "mjp2"],
  "video/mp2t": ["ts", "m2t", "m2ts", "mts"],
  "video/mp4": ["mp4", "mp4v", "mpg4"],
  "video/mpeg": ["mpeg", "mpg", "mpe", "m1v", "m2v"],
  "video/ogg": ["ogv"],
  "video/quicktime": ["qt", "mov"],
  "video/webm": ["webm"]
};
Object.freeze(types2);
var standard_default = types2;

// node_modules/mime/dist/src/Mime.js
var __classPrivateFieldGet = function(receiver, state, kind, f) {
  if (kind === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Mime_extensionToType;
var _Mime_typeToExtension;
var _Mime_typeToExtensions;

class Mime {
  constructor(...args) {
    _Mime_extensionToType.set(this, new Map);
    _Mime_typeToExtension.set(this, new Map);
    _Mime_typeToExtensions.set(this, new Map);
    for (const arg of args) {
      this.define(arg);
    }
  }
  define(typeMap, force = false) {
    for (let [type, extensions] of Object.entries(typeMap)) {
      type = type.toLowerCase();
      extensions = extensions.map((ext) => ext.toLowerCase());
      if (!__classPrivateFieldGet(this, _Mime_typeToExtensions, "f").has(type)) {
        __classPrivateFieldGet(this, _Mime_typeToExtensions, "f").set(type, new Set);
      }
      const allExtensions = __classPrivateFieldGet(this, _Mime_typeToExtensions, "f").get(type);
      let first = true;
      for (let extension of extensions) {
        const starred = extension.startsWith("*");
        extension = starred ? extension.slice(1) : extension;
        allExtensions?.add(extension);
        if (first) {
          __classPrivateFieldGet(this, _Mime_typeToExtension, "f").set(type, extension);
        }
        first = false;
        if (starred)
          continue;
        const currentType = __classPrivateFieldGet(this, _Mime_extensionToType, "f").get(extension);
        if (currentType && currentType != type && !force) {
          throw new Error(`"${type} -> ${extension}" conflicts with "${currentType} -> ${extension}". Pass \`force=true\` to override this definition.`);
        }
        __classPrivateFieldGet(this, _Mime_extensionToType, "f").set(extension, type);
      }
    }
    return this;
  }
  getType(path) {
    if (typeof path !== "string")
      return null;
    const last = path.replace(/^.*[/\\]/s, "").toLowerCase();
    const ext = last.replace(/^.*\./s, "").toLowerCase();
    const hasPath = last.length < path.length;
    const hasDot = ext.length < last.length - 1;
    if (!hasDot && hasPath)
      return null;
    return __classPrivateFieldGet(this, _Mime_extensionToType, "f").get(ext) ?? null;
  }
  getExtension(type) {
    if (typeof type !== "string")
      return null;
    type = type?.split?.(";")[0];
    return (type && __classPrivateFieldGet(this, _Mime_typeToExtension, "f").get(type.trim().toLowerCase())) ?? null;
  }
  getAllExtensions(type) {
    if (typeof type !== "string")
      return null;
    return __classPrivateFieldGet(this, _Mime_typeToExtensions, "f").get(type.toLowerCase()) ?? null;
  }
  _freeze() {
    this.define = () => {
      throw new Error("define() not allowed for built-in Mime objects. See https://github.com/broofa/mime/blob/main/README.md#custom-mime-instances");
    };
    Object.freeze(this);
    for (const extensions of __classPrivateFieldGet(this, _Mime_typeToExtensions, "f").values()) {
      Object.freeze(extensions);
    }
    return this;
  }
  _getTestState() {
    return {
      types: __classPrivateFieldGet(this, _Mime_extensionToType, "f"),
      extensions: __classPrivateFieldGet(this, _Mime_typeToExtension, "f")
    };
  }
}
_Mime_extensionToType = new WeakMap, _Mime_typeToExtension = new WeakMap, _Mime_typeToExtensions = new WeakMap;
var Mime_default = Mime;

// node_modules/mime/dist/src/index.js
var src_default = new Mime_default(standard_default, other_default)._freeze();

// wbn-bundle.js
import crypto from "crypto";
import assert from "assert";
import crypto2 from "crypto";
import crypto3 from "crypto";

// node_modules/to-data-view/index.js
function toDataView(data) {
  if (data instanceof Int8Array || data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
    return new DataView(data.buffer, data.byteOffset, data.byteLength);
  }
  if (data instanceof ArrayBuffer) {
    return new DataView(data);
  }
  throw new TypeError("Expected `data` to be an ArrayBuffer, Buffer, Int8Array, Uint8Array or Uint8ClampedArray");
}

// node_modules/base32-encode/index.js
var RFC4648 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
var RFC4648_HEX = "0123456789ABCDEFGHIJKLMNOPQRSTUV";
var CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function base32Encode(data, variant, options) {
  options = options || {};
  let alphabet, defaultPadding;
  switch (variant) {
    case "RFC3548":
    case "RFC4648":
      alphabet = RFC4648;
      defaultPadding = true;
      break;
    case "RFC4648-HEX":
      alphabet = RFC4648_HEX;
      defaultPadding = true;
      break;
    case "Crockford":
      alphabet = CROCKFORD;
      defaultPadding = false;
      break;
    default:
      throw new Error("Unknown base32 variant: " + variant);
  }
  const padding = options.padding !== undefined ? options.padding : defaultPadding;
  const view = toDataView(data);
  let bits = 0;
  let value = 0;
  let output = "";
  for (let i = 0;i < view.byteLength; i++) {
    value = value << 8 | view.getUint8(i);
    bits += 8;
    while (bits >= 5) {
      output += alphabet[value >>> bits - 5 & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += alphabet[value << 5 - bits & 31];
  }
  if (padding) {
    while (output.length % 8 !== 0) {
      output += "=";
    }
  }
  return output;
}

// wbn-bundle.js
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = /* @__PURE__ */ createRequire(import.meta.url);
var require_lib = __commonJS((exports, module) => {
  var Stream = __require("stream");

  class MuteStream extends Stream {
    #isTTY = null;
    constructor(opts = {}) {
      super(opts);
      this.writable = this.readable = true;
      this.muted = false;
      this.on("pipe", this._onpipe);
      this.replace = opts.replace;
      this._prompt = opts.prompt || null;
      this._hadControl = false;
    }
    #destSrc(key, def) {
      if (this._dest) {
        return this._dest[key];
      }
      if (this._src) {
        return this._src[key];
      }
      return def;
    }
    #proxy(method, ...args) {
      if (typeof this._dest?.[method] === "function") {
        this._dest[method](...args);
      }
      if (typeof this._src?.[method] === "function") {
        this._src[method](...args);
      }
    }
    get isTTY() {
      if (this.#isTTY !== null) {
        return this.#isTTY;
      }
      return this.#destSrc("isTTY", false);
    }
    set isTTY(val) {
      this.#isTTY = val;
    }
    get rows() {
      return this.#destSrc("rows");
    }
    get columns() {
      return this.#destSrc("columns");
    }
    mute() {
      this.muted = true;
    }
    unmute() {
      this.muted = false;
    }
    _onpipe(src) {
      this._src = src;
    }
    pipe(dest, options) {
      this._dest = dest;
      return super.pipe(dest, options);
    }
    pause() {
      if (this._src) {
        return this._src.pause();
      }
    }
    resume() {
      if (this._src) {
        return this._src.resume();
      }
    }
    write(c) {
      if (this.muted) {
        if (!this.replace) {
          return true;
        }
        if (c.match(/^\u001b/)) {
          if (c.indexOf(this._prompt) === 0) {
            c = c.slice(this._prompt.length);
            c = c.replace(/./g, this.replace);
            c = this._prompt + c;
          }
          this._hadControl = true;
          return this.emit("data", c);
        } else {
          if (this._prompt && this._hadControl && c.indexOf(this._prompt) === 0) {
            this._hadControl = false;
            this.emit("data", this._prompt);
            c = c.slice(this._prompt.length);
          }
          c = c.toString().replace(/./g, this.replace);
        }
      }
      this.emit("data", c);
    }
    end(c) {
      if (this.muted) {
        if (c && this.replace) {
          c = c.toString().replace(/./g, this.replace);
        } else {
          c = null;
        }
      }
      if (c) {
        this.emit("data", c);
      }
      this.emit("end");
    }
    destroy(...args) {
      return this.#proxy("destroy", ...args);
    }
    destroySoon(...args) {
      return this.#proxy("destroySoon", ...args);
    }
    close(...args) {
      return this.#proxy("close", ...args);
    }
  }
  module.exports = MuteStream;
});
var require_read = __commonJS((exports, module) => {
  var readline = __require("readline");
  var Mute = require_lib();
  module.exports = async function read({
    default: def = "",
    input = process.stdin,
    output = process.stdout,
    completer,
    prompt = "",
    silent,
    timeout,
    edit,
    terminal,
    replace
  }) {
    if (typeof def !== "undefined" && typeof def !== "string" && typeof def !== "number") {
      throw new Error("default value must be string or number");
    }
    let editDef = false;
    prompt = prompt.trim() + " ";
    terminal = !!(terminal || output.isTTY);
    if (def) {
      if (silent) {
        prompt += "(<default hidden>) ";
      } else if (edit) {
        editDef = true;
      } else {
        prompt += "(" + def + ") ";
      }
    }
    const m = new Mute({ replace, prompt });
    m.pipe(output, { end: false });
    output = m;
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({ input, output, terminal, silent: true, completer });
      const timer = timeout && setTimeout(() => onError(new Error("timed out")), timeout);
      output.unmute();
      rl.setPrompt(prompt);
      rl.prompt();
      if (silent) {
        output.mute();
      } else if (editDef) {
        rl.line = def;
        rl.cursor = def.length;
        rl._refreshLine();
      }
      const done = () => {
        rl.close();
        clearTimeout(timer);
        output.mute();
        output.end();
      };
      const onError = (er) => {
        done();
        reject(er);
      };
      rl.on("error", onError);
      rl.on("line", (line) => {
        if (silent && terminal) {
          output.unmute();
        }
        done();
        const res = line.replace(/\r?\n?$/, "") || def || "";
        return resolve(res);
      });
      rl.on("SIGINT", () => {
        rl.close();
        onError(new Error("canceled"));
      });
    });
  };
});
function is(value) {
  if (value === null) {
    return "null";
  }
  if (value === undefined) {
    return "undefined";
  }
  if (value === true || value === false) {
    return "boolean";
  }
  const typeOf = typeof value;
  if (typeofs.includes(typeOf)) {
    return typeOf;
  }
  if (typeOf === "function") {
    return "Function";
  }
  if (Array.isArray(value)) {
    return "Array";
  }
  if (isBuffer(value)) {
    return "Buffer";
  }
  const objectType = getObjectType(value);
  if (objectType) {
    return objectType;
  }
  return "Object";
}
function isBuffer(value) {
  return value && value.constructor && value.constructor.isBuffer && value.constructor.isBuffer.call(null, value);
}
function getObjectType(value) {
  const objectTypeName = Object.prototype.toString.call(value).slice(8, -1);
  if (objectTypeNames.includes(objectTypeName)) {
    return objectTypeName;
  }
  return;
}
var typeofs = [
  "string",
  "number",
  "bigint",
  "symbol"
];
var objectTypeNames = [
  "Function",
  "Generator",
  "AsyncGenerator",
  "GeneratorFunction",
  "AsyncGeneratorFunction",
  "AsyncFunction",
  "Observable",
  "Array",
  "Buffer",
  "Object",
  "RegExp",
  "Date",
  "Error",
  "Map",
  "Set",
  "WeakMap",
  "WeakSet",
  "ArrayBuffer",
  "SharedArrayBuffer",
  "DataView",
  "Promise",
  "URL",
  "HTMLElement",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Uint16Array",
  "Int32Array",
  "Uint32Array",
  "Float32Array",
  "Float64Array",
  "BigInt64Array",
  "BigUint64Array"
];

class Type {
  constructor(major, name, terminal) {
    this.major = major;
    this.majorEncoded = major << 5;
    this.name = name;
    this.terminal = terminal;
  }
  toString() {
    return `Type[${this.major}].${this.name}`;
  }
  compare(typ) {
    return this.major < typ.major ? -1 : this.major > typ.major ? 1 : 0;
  }
}
Type.uint = new Type(0, "uint", true);
Type.negint = new Type(1, "negint", true);
Type.bytes = new Type(2, "bytes", true);
Type.string = new Type(3, "string", true);
Type.array = new Type(4, "array", false);
Type.map = new Type(5, "map", false);
Type.tag = new Type(6, "tag", false);
Type.float = new Type(7, "float", true);
Type.false = new Type(7, "false", true);
Type.true = new Type(7, "true", true);
Type.null = new Type(7, "null", true);
Type.undefined = new Type(7, "undefined", true);
Type.break = new Type(7, "break", true);

class Token {
  constructor(type, value, encodedLength) {
    this.type = type;
    this.value = value;
    this.encodedLength = encodedLength;
    this.encodedBytes = undefined;
    this.byteValue = undefined;
  }
  toString() {
    return `Token[${this.type}].${this.value}`;
  }
}
function isBuffer2(buf) {
  return useBuffer && globalThis.Buffer.isBuffer(buf);
}
function asU8A(buf) {
  if (!(buf instanceof Uint8Array)) {
    return Uint8Array.from(buf);
  }
  return isBuffer2(buf) ? new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength) : buf;
}
function compare(b1, b2) {
  if (isBuffer2(b1) && isBuffer2(b2)) {
    return b1.compare(b2);
  }
  for (let i = 0;i < b1.length; i++) {
    if (b1[i] === b2[i]) {
      continue;
    }
    return b1[i] < b2[i] ? -1 : 1;
  }
  return 0;
}
function utf8ToBytes(string, units = Infinity) {
  let codePoint;
  const length = string.length;
  let leadSurrogate = null;
  const bytes = [];
  for (let i = 0;i < length; ++i) {
    codePoint = string.charCodeAt(i);
    if (codePoint > 55295 && codePoint < 57344) {
      if (!leadSurrogate) {
        if (codePoint > 56319) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
          continue;
        } else if (i + 1 === length) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
          continue;
        }
        leadSurrogate = codePoint;
        continue;
      }
      if (codePoint < 56320) {
        if ((units -= 3) > -1)
          bytes.push(239, 191, 189);
        leadSurrogate = codePoint;
        continue;
      }
      codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
    } else if (leadSurrogate) {
      if ((units -= 3) > -1)
        bytes.push(239, 191, 189);
    }
    leadSurrogate = null;
    if (codePoint < 128) {
      if ((units -= 1) < 0)
        break;
      bytes.push(codePoint);
    } else if (codePoint < 2048) {
      if ((units -= 2) < 0)
        break;
      bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
    } else if (codePoint < 65536) {
      if ((units -= 3) < 0)
        break;
      bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
    } else if (codePoint < 1114112) {
      if ((units -= 4) < 0)
        break;
      bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
    } else {
      throw new Error("Invalid code point");
    }
  }
  return bytes;
}
function utf8Slice(buf, offset, end) {
  const res = [];
  while (offset < end) {
    const firstByte = buf[offset];
    let codePoint = null;
    let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
    if (offset + bytesPerSequence <= end) {
      let secondByte, thirdByte, fourthByte, tempCodePoint;
      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 128) {
            codePoint = firstByte;
          }
          break;
        case 2:
          secondByte = buf[offset + 1];
          if ((secondByte & 192) === 128) {
            tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
            if (tempCodePoint > 127) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 3:
          secondByte = buf[offset + 1];
          thirdByte = buf[offset + 2];
          if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
            tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
            if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 4:
          secondByte = buf[offset + 1];
          thirdByte = buf[offset + 2];
          fourthByte = buf[offset + 3];
          if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
            tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
            if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
              codePoint = tempCodePoint;
            }
          }
      }
    }
    if (codePoint === null) {
      codePoint = 65533;
      bytesPerSequence = 1;
    } else if (codePoint > 65535) {
      codePoint -= 65536;
      res.push(codePoint >>> 10 & 1023 | 55296);
      codePoint = 56320 | codePoint & 1023;
    }
    res.push(codePoint);
    offset += bytesPerSequence;
  }
  return decodeCodePointsArray(res);
}
function decodeCodePointsArray(codePoints) {
  const len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints);
  }
  let res = "";
  let i = 0;
  while (i < len) {
    res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
  }
  return res;
}
var useBuffer = globalThis.process && !globalThis.process.browser && globalThis.Buffer && typeof globalThis.Buffer.isBuffer === "function";
var textDecoder = new TextDecoder;
var textEncoder = new TextEncoder;
var toString = useBuffer ? (bytes, start, end) => {
  return end - start > 64 ? globalThis.Buffer.from(bytes.subarray(start, end)).toString("utf8") : utf8Slice(bytes, start, end);
} : (bytes, start, end) => {
  return end - start > 64 ? textDecoder.decode(bytes.subarray(start, end)) : utf8Slice(bytes, start, end);
};
var fromString = useBuffer ? (string) => {
  return string.length > 64 ? globalThis.Buffer.from(string) : utf8ToBytes(string);
} : (string) => {
  return string.length > 64 ? textEncoder.encode(string) : utf8ToBytes(string);
};
var fromArray = (arr) => {
  return Uint8Array.from(arr);
};
var slice = useBuffer ? (bytes, start, end) => {
  if (isBuffer2(bytes)) {
    return new Uint8Array(bytes.subarray(start, end));
  }
  return bytes.slice(start, end);
} : (bytes, start, end) => {
  return bytes.slice(start, end);
};
var concat = useBuffer ? (chunks, length) => {
  chunks = chunks.map((c) => c instanceof Uint8Array ? c : globalThis.Buffer.from(c));
  return asU8A(globalThis.Buffer.concat(chunks, length));
} : (chunks, length) => {
  const out = new Uint8Array(length);
  let off = 0;
  for (let b of chunks) {
    if (off + b.length > out.length) {
      b = b.subarray(0, out.length - off);
    }
    out.set(b, off);
    off += b.length;
  }
  return out;
};
var alloc = useBuffer ? (size) => {
  return globalThis.Buffer.allocUnsafe(size);
} : (size) => {
  return new Uint8Array(size);
};
var MAX_ARGUMENTS_LENGTH = 4096;
var defaultChunkSize = 256;

class Bl {
  constructor(chunkSize = defaultChunkSize) {
    this.chunkSize = chunkSize;
    this.cursor = 0;
    this.maxCursor = -1;
    this.chunks = [];
    this._initReuseChunk = null;
  }
  reset() {
    this.cursor = 0;
    this.maxCursor = -1;
    if (this.chunks.length) {
      this.chunks = [];
    }
    if (this._initReuseChunk !== null) {
      this.chunks.push(this._initReuseChunk);
      this.maxCursor = this._initReuseChunk.length - 1;
    }
  }
  push(bytes) {
    let topChunk = this.chunks[this.chunks.length - 1];
    const newMax = this.cursor + bytes.length;
    if (newMax <= this.maxCursor + 1) {
      const chunkPos = topChunk.length - (this.maxCursor - this.cursor) - 1;
      topChunk.set(bytes, chunkPos);
    } else {
      if (topChunk) {
        const chunkPos = topChunk.length - (this.maxCursor - this.cursor) - 1;
        if (chunkPos < topChunk.length) {
          this.chunks[this.chunks.length - 1] = topChunk.subarray(0, chunkPos);
          this.maxCursor = this.cursor - 1;
        }
      }
      if (bytes.length < 64 && bytes.length < this.chunkSize) {
        topChunk = alloc(this.chunkSize);
        this.chunks.push(topChunk);
        this.maxCursor += topChunk.length;
        if (this._initReuseChunk === null) {
          this._initReuseChunk = topChunk;
        }
        topChunk.set(bytes, 0);
      } else {
        this.chunks.push(bytes);
        this.maxCursor += bytes.length;
      }
    }
    this.cursor += bytes.length;
  }
  toBytes(reset = false) {
    let byts;
    if (this.chunks.length === 1) {
      const chunk = this.chunks[0];
      if (reset && this.cursor > chunk.length / 2) {
        byts = this.cursor === chunk.length ? chunk : chunk.subarray(0, this.cursor);
        this._initReuseChunk = null;
        this.chunks = [];
      } else {
        byts = slice(chunk, 0, this.cursor);
      }
    } else {
      byts = concat(this.chunks, this.cursor);
    }
    if (reset) {
      this.reset();
    }
    return byts;
  }
}
function assertEnoughData(data, pos, need) {
  if (data.length - pos < need) {
    throw new Error(`${decodeErrPrefix} not enough data for type`);
  }
}
var decodeErrPrefix = "CBOR decode error:";
var encodeErrPrefix = "CBOR encode error:";
var uintMinorPrefixBytes = [];
uintMinorPrefixBytes[23] = 1;
uintMinorPrefixBytes[24] = 2;
uintMinorPrefixBytes[25] = 3;
uintMinorPrefixBytes[26] = 5;
uintMinorPrefixBytes[27] = 9;
function readUint8(data, offset, options) {
  assertEnoughData(data, offset, 1);
  const value = data[offset];
  if (options.strict === true && value < uintBoundaries[0]) {
    throw new Error(`${decodeErrPrefix} integer encoded in more bytes than necessary (strict decode)`);
  }
  return value;
}
function readUint16(data, offset, options) {
  assertEnoughData(data, offset, 2);
  const value = data[offset] << 8 | data[offset + 1];
  if (options.strict === true && value < uintBoundaries[1]) {
    throw new Error(`${decodeErrPrefix} integer encoded in more bytes than necessary (strict decode)`);
  }
  return value;
}
function readUint32(data, offset, options) {
  assertEnoughData(data, offset, 4);
  const value = data[offset] * 16777216 + (data[offset + 1] << 16) + (data[offset + 2] << 8) + data[offset + 3];
  if (options.strict === true && value < uintBoundaries[2]) {
    throw new Error(`${decodeErrPrefix} integer encoded in more bytes than necessary (strict decode)`);
  }
  return value;
}
function readUint64(data, offset, options) {
  assertEnoughData(data, offset, 8);
  const hi = data[offset] * 16777216 + (data[offset + 1] << 16) + (data[offset + 2] << 8) + data[offset + 3];
  const lo = data[offset + 4] * 16777216 + (data[offset + 5] << 16) + (data[offset + 6] << 8) + data[offset + 7];
  const value = (BigInt(hi) << BigInt(32)) + BigInt(lo);
  if (options.strict === true && value < uintBoundaries[3]) {
    throw new Error(`${decodeErrPrefix} integer encoded in more bytes than necessary (strict decode)`);
  }
  if (value <= Number.MAX_SAFE_INTEGER) {
    return Number(value);
  }
  if (options.allowBigInt === true) {
    return value;
  }
  throw new Error(`${decodeErrPrefix} integers outside of the safe integer range are not supported`);
}
function decodeUint8(data, pos, _minor, options) {
  return new Token(Type.uint, readUint8(data, pos + 1, options), 2);
}
function decodeUint16(data, pos, _minor, options) {
  return new Token(Type.uint, readUint16(data, pos + 1, options), 3);
}
function decodeUint32(data, pos, _minor, options) {
  return new Token(Type.uint, readUint32(data, pos + 1, options), 5);
}
function decodeUint64(data, pos, _minor, options) {
  return new Token(Type.uint, readUint64(data, pos + 1, options), 9);
}
function encodeUint(buf, token2) {
  return encodeUintValue(buf, 0, token2.value);
}
function encodeUintValue(buf, major, uint) {
  if (uint < uintBoundaries[0]) {
    const nuint = Number(uint);
    buf.push([major | nuint]);
  } else if (uint < uintBoundaries[1]) {
    const nuint = Number(uint);
    buf.push([
      major | 24,
      nuint
    ]);
  } else if (uint < uintBoundaries[2]) {
    const nuint = Number(uint);
    buf.push([
      major | 25,
      nuint >>> 8,
      nuint & 255
    ]);
  } else if (uint < uintBoundaries[3]) {
    const nuint = Number(uint);
    buf.push([
      major | 26,
      nuint >>> 24 & 255,
      nuint >>> 16 & 255,
      nuint >>> 8 & 255,
      nuint & 255
    ]);
  } else {
    const buint = BigInt(uint);
    if (buint < uintBoundaries[4]) {
      const set = [
        major | 27,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ];
      let lo = Number(buint & BigInt(4294967295));
      let hi = Number(buint >> BigInt(32) & BigInt(4294967295));
      set[8] = lo & 255;
      lo = lo >> 8;
      set[7] = lo & 255;
      lo = lo >> 8;
      set[6] = lo & 255;
      lo = lo >> 8;
      set[5] = lo & 255;
      set[4] = hi & 255;
      hi = hi >> 8;
      set[3] = hi & 255;
      hi = hi >> 8;
      set[2] = hi & 255;
      hi = hi >> 8;
      set[1] = hi & 255;
      buf.push(set);
    } else {
      throw new Error(`${decodeErrPrefix} encountered BigInt larger than allowable range`);
    }
  }
}
var uintBoundaries = [
  24,
  256,
  65536,
  4294967296,
  BigInt("18446744073709551616")
];
encodeUint.encodedSize = function encodedSize(token2) {
  return encodeUintValue.encodedSize(token2.value);
};
encodeUintValue.encodedSize = function encodedSize2(uint) {
  if (uint < uintBoundaries[0]) {
    return 1;
  }
  if (uint < uintBoundaries[1]) {
    return 2;
  }
  if (uint < uintBoundaries[2]) {
    return 3;
  }
  if (uint < uintBoundaries[3]) {
    return 5;
  }
  return 9;
};
encodeUint.compareTokens = function compareTokens(tok1, tok2) {
  return tok1.value < tok2.value ? -1 : tok1.value > tok2.value ? 1 : 0;
};
function decodeNegint8(data, pos, _minor, options) {
  return new Token(Type.negint, -1 - readUint8(data, pos + 1, options), 2);
}
function decodeNegint16(data, pos, _minor, options) {
  return new Token(Type.negint, -1 - readUint16(data, pos + 1, options), 3);
}
function decodeNegint32(data, pos, _minor, options) {
  return new Token(Type.negint, -1 - readUint32(data, pos + 1, options), 5);
}
function decodeNegint64(data, pos, _minor, options) {
  const int = readUint64(data, pos + 1, options);
  if (typeof int !== "bigint") {
    const value = -1 - int;
    if (value >= Number.MIN_SAFE_INTEGER) {
      return new Token(Type.negint, value, 9);
    }
  }
  if (options.allowBigInt !== true) {
    throw new Error(`${decodeErrPrefix} integers outside of the safe integer range are not supported`);
  }
  return new Token(Type.negint, neg1b - BigInt(int), 9);
}
function encodeNegint(buf, token3) {
  const negint = token3.value;
  const unsigned = typeof negint === "bigint" ? negint * neg1b - pos1b : negint * -1 - 1;
  encodeUintValue(buf, token3.type.majorEncoded, unsigned);
}
var neg1b = BigInt(-1);
var pos1b = BigInt(1);
encodeNegint.encodedSize = function encodedSize3(token3) {
  const negint = token3.value;
  const unsigned = typeof negint === "bigint" ? negint * neg1b - pos1b : negint * -1 - 1;
  if (unsigned < uintBoundaries[0]) {
    return 1;
  }
  if (unsigned < uintBoundaries[1]) {
    return 2;
  }
  if (unsigned < uintBoundaries[2]) {
    return 3;
  }
  if (unsigned < uintBoundaries[3]) {
    return 5;
  }
  return 9;
};
encodeNegint.compareTokens = function compareTokens2(tok1, tok2) {
  return tok1.value < tok2.value ? 1 : tok1.value > tok2.value ? -1 : 0;
};
function toToken(data, pos, prefix, length) {
  assertEnoughData(data, pos, prefix + length);
  const buf = slice(data, pos + prefix, pos + prefix + length);
  return new Token(Type.bytes, buf, prefix + length);
}
function decodeBytesCompact(data, pos, minor, _options) {
  return toToken(data, pos, 1, minor);
}
function decodeBytes8(data, pos, _minor, options) {
  return toToken(data, pos, 2, readUint8(data, pos + 1, options));
}
function decodeBytes16(data, pos, _minor, options) {
  return toToken(data, pos, 3, readUint16(data, pos + 1, options));
}
function decodeBytes32(data, pos, _minor, options) {
  return toToken(data, pos, 5, readUint32(data, pos + 1, options));
}
function decodeBytes64(data, pos, _minor, options) {
  const l = readUint64(data, pos + 1, options);
  if (typeof l === "bigint") {
    throw new Error(`${decodeErrPrefix} 64-bit integer bytes lengths not supported`);
  }
  return toToken(data, pos, 9, l);
}
function tokenBytes(token4) {
  if (token4.encodedBytes === undefined) {
    token4.encodedBytes = token4.type === Type.string ? fromString(token4.value) : token4.value;
  }
  return token4.encodedBytes;
}
function encodeBytes(buf, token4) {
  const bytes = tokenBytes(token4);
  encodeUintValue(buf, token4.type.majorEncoded, bytes.length);
  buf.push(bytes);
}
function compareBytes(b1, b2) {
  return b1.length < b2.length ? -1 : b1.length > b2.length ? 1 : compare(b1, b2);
}
encodeBytes.encodedSize = function encodedSize4(token4) {
  const bytes = tokenBytes(token4);
  return encodeUintValue.encodedSize(bytes.length) + bytes.length;
};
encodeBytes.compareTokens = function compareTokens3(tok1, tok2) {
  return compareBytes(tokenBytes(tok1), tokenBytes(tok2));
};
function toToken2(data, pos, prefix, length, options) {
  const totLength = prefix + length;
  assertEnoughData(data, pos, totLength);
  const tok = new Token(Type.string, toString(data, pos + prefix, pos + totLength), totLength);
  if (options.retainStringBytes === true) {
    tok.byteValue = slice(data, pos + prefix, pos + totLength);
  }
  return tok;
}
function decodeStringCompact(data, pos, minor, options) {
  return toToken2(data, pos, 1, minor, options);
}
function decodeString8(data, pos, _minor, options) {
  return toToken2(data, pos, 2, readUint8(data, pos + 1, options), options);
}
function decodeString16(data, pos, _minor, options) {
  return toToken2(data, pos, 3, readUint16(data, pos + 1, options), options);
}
function decodeString32(data, pos, _minor, options) {
  return toToken2(data, pos, 5, readUint32(data, pos + 1, options), options);
}
function decodeString64(data, pos, _minor, options) {
  const l = readUint64(data, pos + 1, options);
  if (typeof l === "bigint") {
    throw new Error(`${decodeErrPrefix} 64-bit integer string lengths not supported`);
  }
  return toToken2(data, pos, 9, l, options);
}
var encodeString = encodeBytes;
function toToken3(_data, _pos, prefix, length) {
  return new Token(Type.array, length, prefix);
}
function decodeArrayCompact(data, pos, minor, _options) {
  return toToken3(data, pos, 1, minor);
}
function decodeArray8(data, pos, _minor, options) {
  return toToken3(data, pos, 2, readUint8(data, pos + 1, options));
}
function decodeArray16(data, pos, _minor, options) {
  return toToken3(data, pos, 3, readUint16(data, pos + 1, options));
}
function decodeArray32(data, pos, _minor, options) {
  return toToken3(data, pos, 5, readUint32(data, pos + 1, options));
}
function decodeArray64(data, pos, _minor, options) {
  const l = readUint64(data, pos + 1, options);
  if (typeof l === "bigint") {
    throw new Error(`${decodeErrPrefix} 64-bit integer array lengths not supported`);
  }
  return toToken3(data, pos, 9, l);
}
function decodeArrayIndefinite(data, pos, _minor, options) {
  if (options.allowIndefinite === false) {
    throw new Error(`${decodeErrPrefix} indefinite length items not allowed`);
  }
  return toToken3(data, pos, 1, Infinity);
}
function encodeArray(buf, token6) {
  encodeUintValue(buf, Type.array.majorEncoded, token6.value);
}
encodeArray.compareTokens = encodeUint.compareTokens;
encodeArray.encodedSize = function encodedSize5(token6) {
  return encodeUintValue.encodedSize(token6.value);
};
function toToken4(_data, _pos, prefix, length) {
  return new Token(Type.map, length, prefix);
}
function decodeMapCompact(data, pos, minor, _options) {
  return toToken4(data, pos, 1, minor);
}
function decodeMap8(data, pos, _minor, options) {
  return toToken4(data, pos, 2, readUint8(data, pos + 1, options));
}
function decodeMap16(data, pos, _minor, options) {
  return toToken4(data, pos, 3, readUint16(data, pos + 1, options));
}
function decodeMap32(data, pos, _minor, options) {
  return toToken4(data, pos, 5, readUint32(data, pos + 1, options));
}
function decodeMap64(data, pos, _minor, options) {
  const l = readUint64(data, pos + 1, options);
  if (typeof l === "bigint") {
    throw new Error(`${decodeErrPrefix} 64-bit integer map lengths not supported`);
  }
  return toToken4(data, pos, 9, l);
}
function decodeMapIndefinite(data, pos, _minor, options) {
  if (options.allowIndefinite === false) {
    throw new Error(`${decodeErrPrefix} indefinite length items not allowed`);
  }
  return toToken4(data, pos, 1, Infinity);
}
function encodeMap(buf, token7) {
  encodeUintValue(buf, Type.map.majorEncoded, token7.value);
}
encodeMap.compareTokens = encodeUint.compareTokens;
encodeMap.encodedSize = function encodedSize6(token7) {
  return encodeUintValue.encodedSize(token7.value);
};
function decodeTagCompact(_data, _pos, minor, _options) {
  return new Token(Type.tag, minor, 1);
}
function decodeTag8(data, pos, _minor, options) {
  return new Token(Type.tag, readUint8(data, pos + 1, options), 2);
}
function decodeTag16(data, pos, _minor, options) {
  return new Token(Type.tag, readUint16(data, pos + 1, options), 3);
}
function decodeTag32(data, pos, _minor, options) {
  return new Token(Type.tag, readUint32(data, pos + 1, options), 5);
}
function decodeTag64(data, pos, _minor, options) {
  return new Token(Type.tag, readUint64(data, pos + 1, options), 9);
}
function encodeTag(buf, token8) {
  encodeUintValue(buf, Type.tag.majorEncoded, token8.value);
}
encodeTag.compareTokens = encodeUint.compareTokens;
encodeTag.encodedSize = function encodedSize7(token8) {
  return encodeUintValue.encodedSize(token8.value);
};
function decodeUndefined(_data, _pos, _minor, options) {
  if (options.allowUndefined === false) {
    throw new Error(`${decodeErrPrefix} undefined values are not supported`);
  } else if (options.coerceUndefinedToNull === true) {
    return new Token(Type.null, null, 1);
  }
  return new Token(Type.undefined, undefined, 1);
}
function decodeBreak(_data, _pos, _minor, options) {
  if (options.allowIndefinite === false) {
    throw new Error(`${decodeErrPrefix} indefinite length items not allowed`);
  }
  return new Token(Type.break, undefined, 1);
}
function createToken(value, bytes, options) {
  if (options) {
    if (options.allowNaN === false && Number.isNaN(value)) {
      throw new Error(`${decodeErrPrefix} NaN values are not supported`);
    }
    if (options.allowInfinity === false && (value === Infinity || value === -Infinity)) {
      throw new Error(`${decodeErrPrefix} Infinity values are not supported`);
    }
  }
  return new Token(Type.float, value, bytes);
}
function decodeFloat16(data, pos, _minor, options) {
  return createToken(readFloat16(data, pos + 1), 3, options);
}
function decodeFloat32(data, pos, _minor, options) {
  return createToken(readFloat32(data, pos + 1), 5, options);
}
function decodeFloat64(data, pos, _minor, options) {
  return createToken(readFloat64(data, pos + 1), 9, options);
}
function encodeFloat(buf, token9, options) {
  const float = token9.value;
  if (float === false) {
    buf.push([Type.float.majorEncoded | MINOR_FALSE]);
  } else if (float === true) {
    buf.push([Type.float.majorEncoded | MINOR_TRUE]);
  } else if (float === null) {
    buf.push([Type.float.majorEncoded | MINOR_NULL]);
  } else if (float === undefined) {
    buf.push([Type.float.majorEncoded | MINOR_UNDEFINED]);
  } else {
    let decoded;
    let success = false;
    if (!options || options.float64 !== true) {
      encodeFloat16(float);
      decoded = readFloat16(ui8a, 1);
      if (float === decoded || Number.isNaN(float)) {
        ui8a[0] = 249;
        buf.push(ui8a.slice(0, 3));
        success = true;
      } else {
        encodeFloat32(float);
        decoded = readFloat32(ui8a, 1);
        if (float === decoded) {
          ui8a[0] = 250;
          buf.push(ui8a.slice(0, 5));
          success = true;
        }
      }
    }
    if (!success) {
      encodeFloat64(float);
      decoded = readFloat64(ui8a, 1);
      ui8a[0] = 251;
      buf.push(ui8a.slice(0, 9));
    }
  }
}
function encodeFloat16(inp) {
  if (inp === Infinity) {
    dataView.setUint16(0, 31744, false);
  } else if (inp === -Infinity) {
    dataView.setUint16(0, 64512, false);
  } else if (Number.isNaN(inp)) {
    dataView.setUint16(0, 32256, false);
  } else {
    dataView.setFloat32(0, inp);
    const valu32 = dataView.getUint32(0);
    const exponent = (valu32 & 2139095040) >> 23;
    const mantissa = valu32 & 8388607;
    if (exponent === 255) {
      dataView.setUint16(0, 31744, false);
    } else if (exponent === 0) {
      dataView.setUint16(0, (inp & 2147483648) >> 16 | mantissa >> 13, false);
    } else {
      const logicalExponent = exponent - 127;
      if (logicalExponent < -24) {
        dataView.setUint16(0, 0);
      } else if (logicalExponent < -14) {
        dataView.setUint16(0, (valu32 & 2147483648) >> 16 | 1 << 24 + logicalExponent, false);
      } else {
        dataView.setUint16(0, (valu32 & 2147483648) >> 16 | logicalExponent + 15 << 10 | mantissa >> 13, false);
      }
    }
  }
}
function readFloat16(ui8a, pos) {
  if (ui8a.length - pos < 2) {
    throw new Error(`${decodeErrPrefix} not enough data for float16`);
  }
  const half = (ui8a[pos] << 8) + ui8a[pos + 1];
  if (half === 31744) {
    return Infinity;
  }
  if (half === 64512) {
    return -Infinity;
  }
  if (half === 32256) {
    return NaN;
  }
  const exp = half >> 10 & 31;
  const mant = half & 1023;
  let val;
  if (exp === 0) {
    val = mant * 2 ** -24;
  } else if (exp !== 31) {
    val = (mant + 1024) * 2 ** (exp - 25);
  } else {
    val = mant === 0 ? Infinity : NaN;
  }
  return half & 32768 ? -val : val;
}
function encodeFloat32(inp) {
  dataView.setFloat32(0, inp, false);
}
function readFloat32(ui8a, pos) {
  if (ui8a.length - pos < 4) {
    throw new Error(`${decodeErrPrefix} not enough data for float32`);
  }
  const offset = (ui8a.byteOffset || 0) + pos;
  return new DataView(ui8a.buffer, offset, 4).getFloat32(0, false);
}
function encodeFloat64(inp) {
  dataView.setFloat64(0, inp, false);
}
function readFloat64(ui8a, pos) {
  if (ui8a.length - pos < 8) {
    throw new Error(`${decodeErrPrefix} not enough data for float64`);
  }
  const offset = (ui8a.byteOffset || 0) + pos;
  return new DataView(ui8a.buffer, offset, 8).getFloat64(0, false);
}
var MINOR_FALSE = 20;
var MINOR_TRUE = 21;
var MINOR_NULL = 22;
var MINOR_UNDEFINED = 23;
encodeFloat.encodedSize = function encodedSize8(token9, options) {
  const float = token9.value;
  if (float === false || float === true || float === null || float === undefined) {
    return 1;
  }
  if (!options || options.float64 !== true) {
    encodeFloat16(float);
    let decoded = readFloat16(ui8a, 1);
    if (float === decoded || Number.isNaN(float)) {
      return 3;
    }
    encodeFloat32(float);
    decoded = readFloat32(ui8a, 1);
    if (float === decoded) {
      return 5;
    }
  }
  return 9;
};
var buffer = new ArrayBuffer(9);
var dataView = new DataView(buffer, 1);
var ui8a = new Uint8Array(buffer, 0);
encodeFloat.compareTokens = encodeUint.compareTokens;
function invalidMinor(data, pos, minor) {
  throw new Error(`${decodeErrPrefix} encountered invalid minor (${minor}) for major ${data[pos] >>> 5}`);
}
function errorer(msg) {
  return () => {
    throw new Error(`${decodeErrPrefix} ${msg}`);
  };
}
function quickEncodeToken(token10) {
  switch (token10.type) {
    case Type.false:
      return fromArray([244]);
    case Type.true:
      return fromArray([245]);
    case Type.null:
      return fromArray([246]);
    case Type.bytes:
      if (!token10.value.length) {
        return fromArray([64]);
      }
      return;
    case Type.string:
      if (token10.value === "") {
        return fromArray([96]);
      }
      return;
    case Type.array:
      if (token10.value === 0) {
        return fromArray([128]);
      }
      return;
    case Type.map:
      if (token10.value === 0) {
        return fromArray([160]);
      }
      return;
    case Type.uint:
      if (token10.value < 24) {
        return fromArray([Number(token10.value)]);
      }
      return;
    case Type.negint:
      if (token10.value >= -24) {
        return fromArray([31 - Number(token10.value)]);
      }
  }
}
var jump = [];
for (let i = 0;i <= 23; i++) {
  jump[i] = invalidMinor;
}
jump[24] = decodeUint8;
jump[25] = decodeUint16;
jump[26] = decodeUint32;
jump[27] = decodeUint64;
jump[28] = invalidMinor;
jump[29] = invalidMinor;
jump[30] = invalidMinor;
jump[31] = invalidMinor;
for (let i = 32;i <= 55; i++) {
  jump[i] = invalidMinor;
}
jump[56] = decodeNegint8;
jump[57] = decodeNegint16;
jump[58] = decodeNegint32;
jump[59] = decodeNegint64;
jump[60] = invalidMinor;
jump[61] = invalidMinor;
jump[62] = invalidMinor;
jump[63] = invalidMinor;
for (let i = 64;i <= 87; i++) {
  jump[i] = decodeBytesCompact;
}
jump[88] = decodeBytes8;
jump[89] = decodeBytes16;
jump[90] = decodeBytes32;
jump[91] = decodeBytes64;
jump[92] = invalidMinor;
jump[93] = invalidMinor;
jump[94] = invalidMinor;
jump[95] = errorer("indefinite length bytes/strings are not supported");
for (let i = 96;i <= 119; i++) {
  jump[i] = decodeStringCompact;
}
jump[120] = decodeString8;
jump[121] = decodeString16;
jump[122] = decodeString32;
jump[123] = decodeString64;
jump[124] = invalidMinor;
jump[125] = invalidMinor;
jump[126] = invalidMinor;
jump[127] = errorer("indefinite length bytes/strings are not supported");
for (let i = 128;i <= 151; i++) {
  jump[i] = decodeArrayCompact;
}
jump[152] = decodeArray8;
jump[153] = decodeArray16;
jump[154] = decodeArray32;
jump[155] = decodeArray64;
jump[156] = invalidMinor;
jump[157] = invalidMinor;
jump[158] = invalidMinor;
jump[159] = decodeArrayIndefinite;
for (let i = 160;i <= 183; i++) {
  jump[i] = decodeMapCompact;
}
jump[184] = decodeMap8;
jump[185] = decodeMap16;
jump[186] = decodeMap32;
jump[187] = decodeMap64;
jump[188] = invalidMinor;
jump[189] = invalidMinor;
jump[190] = invalidMinor;
jump[191] = decodeMapIndefinite;
for (let i = 192;i <= 215; i++) {
  jump[i] = decodeTagCompact;
}
jump[216] = decodeTag8;
jump[217] = decodeTag16;
jump[218] = decodeTag32;
jump[219] = decodeTag64;
jump[220] = invalidMinor;
jump[221] = invalidMinor;
jump[222] = invalidMinor;
jump[223] = invalidMinor;
for (let i = 224;i <= 243; i++) {
  jump[i] = errorer("simple values are not supported");
}
jump[244] = invalidMinor;
jump[245] = invalidMinor;
jump[246] = invalidMinor;
jump[247] = decodeUndefined;
jump[248] = errorer("simple values are not supported");
jump[249] = decodeFloat16;
jump[250] = decodeFloat32;
jump[251] = decodeFloat64;
jump[252] = invalidMinor;
jump[253] = invalidMinor;
jump[254] = invalidMinor;
jump[255] = decodeBreak;
var quick = [];
for (let i = 0;i < 24; i++) {
  quick[i] = new Token(Type.uint, i, 1);
}
for (let i = -1;i >= -24; i--) {
  quick[31 - i] = new Token(Type.negint, i, 1);
}
quick[64] = new Token(Type.bytes, new Uint8Array(0), 1);
quick[96] = new Token(Type.string, "", 1);
quick[128] = new Token(Type.array, 0, 1);
quick[160] = new Token(Type.map, 0, 1);
quick[244] = new Token(Type.false, false, 1);
quick[245] = new Token(Type.true, true, 1);
quick[246] = new Token(Type.null, null, 1);
function makeCborEncoders() {
  const encoders = [];
  encoders[Type.uint.major] = encodeUint;
  encoders[Type.negint.major] = encodeNegint;
  encoders[Type.bytes.major] = encodeBytes;
  encoders[Type.string.major] = encodeString;
  encoders[Type.array.major] = encodeArray;
  encoders[Type.map.major] = encodeMap;
  encoders[Type.tag.major] = encodeTag;
  encoders[Type.float.major] = encodeFloat;
  return encoders;
}
function objectToTokens(obj, options = {}, refStack) {
  const typ = is(obj);
  const customTypeEncoder = options && options.typeEncoders && options.typeEncoders[typ] || typeEncoders[typ];
  if (typeof customTypeEncoder === "function") {
    const tokens = customTypeEncoder(obj, typ, options, refStack);
    if (tokens != null) {
      return tokens;
    }
  }
  const typeEncoder = typeEncoders[typ];
  if (!typeEncoder) {
    throw new Error(`${encodeErrPrefix} unsupported type: ${typ}`);
  }
  return typeEncoder(obj, typ, options, refStack);
}
function sortMapEntries(entries, options) {
  if (options.mapSorter) {
    entries.sort(options.mapSorter);
  }
}
function mapSorter(e1, e2) {
  const keyToken1 = Array.isArray(e1[0]) ? e1[0][0] : e1[0];
  const keyToken2 = Array.isArray(e2[0]) ? e2[0][0] : e2[0];
  if (keyToken1.type !== keyToken2.type) {
    return keyToken1.type.compare(keyToken2.type);
  }
  const major = keyToken1.type.major;
  const tcmp = cborEncoders[major].compareTokens(keyToken1, keyToken2);
  if (tcmp === 0) {
    console.warn("WARNING: complex key types used, CBOR key sorting guarantees are gone");
  }
  return tcmp;
}
function tokensToEncoded(buf, tokens, encoders, options) {
  if (Array.isArray(tokens)) {
    for (const token11 of tokens) {
      tokensToEncoded(buf, token11, encoders, options);
    }
  } else {
    encoders[tokens.type.major](buf, tokens, options);
  }
}
function encodeCustom(data, encoders, options) {
  const tokens = objectToTokens(data, options);
  if (!Array.isArray(tokens) && options.quickEncodeToken) {
    const quickBytes = options.quickEncodeToken(tokens);
    if (quickBytes) {
      return quickBytes;
    }
    const encoder = encoders[tokens.type.major];
    if (encoder.encodedSize) {
      const size = encoder.encodedSize(tokens, options);
      const buf = new Bl(size);
      encoder(buf, tokens, options);
      if (buf.chunks.length !== 1) {
        throw new Error(`Unexpected error: pre-calculated length for ${tokens} was wrong`);
      }
      return asU8A(buf.chunks[0]);
    }
  }
  buf.reset();
  tokensToEncoded(buf, tokens, encoders, options);
  return buf.toBytes(true);
}
function encode(data, options) {
  options = Object.assign({}, defaultEncodeOptions, options);
  return encodeCustom(data, cborEncoders, options);
}
var defaultEncodeOptions = {
  float64: false,
  mapSorter,
  quickEncodeToken
};
var cborEncoders = makeCborEncoders();
var buf = new Bl;

class Ref {
  constructor(obj, parent) {
    this.obj = obj;
    this.parent = parent;
  }
  includes(obj) {
    let p = this;
    do {
      if (p.obj === obj) {
        return true;
      }
    } while (p = p.parent);
    return false;
  }
  static createCheck(stack, obj) {
    if (stack && stack.includes(obj)) {
      throw new Error(`${encodeErrPrefix} object contains circular references`);
    }
    return new Ref(obj, stack);
  }
}
var simpleTokens = {
  null: new Token(Type.null, null),
  undefined: new Token(Type.undefined, undefined),
  true: new Token(Type.true, true),
  false: new Token(Type.false, false),
  emptyArray: new Token(Type.array, 0),
  emptyMap: new Token(Type.map, 0)
};
var typeEncoders = {
  number(obj, _typ, _options, _refStack) {
    if (!Number.isInteger(obj) || !Number.isSafeInteger(obj)) {
      return new Token(Type.float, obj);
    } else if (obj >= 0) {
      return new Token(Type.uint, obj);
    } else {
      return new Token(Type.negint, obj);
    }
  },
  bigint(obj, _typ, _options, _refStack) {
    if (obj >= BigInt(0)) {
      return new Token(Type.uint, obj);
    } else {
      return new Token(Type.negint, obj);
    }
  },
  Uint8Array(obj, _typ, _options, _refStack) {
    return new Token(Type.bytes, obj);
  },
  string(obj, _typ, _options, _refStack) {
    return new Token(Type.string, obj);
  },
  boolean(obj, _typ, _options, _refStack) {
    return obj ? simpleTokens.true : simpleTokens.false;
  },
  null(_obj, _typ, _options, _refStack) {
    return simpleTokens.null;
  },
  undefined(_obj, _typ, _options, _refStack) {
    return simpleTokens.undefined;
  },
  ArrayBuffer(obj, _typ, _options, _refStack) {
    return new Token(Type.bytes, new Uint8Array(obj));
  },
  DataView(obj, _typ, _options, _refStack) {
    return new Token(Type.bytes, new Uint8Array(obj.buffer, obj.byteOffset, obj.byteLength));
  },
  Array(obj, _typ, options, refStack) {
    if (!obj.length) {
      if (options.addBreakTokens === true) {
        return [
          simpleTokens.emptyArray,
          new Token(Type.break)
        ];
      }
      return simpleTokens.emptyArray;
    }
    refStack = Ref.createCheck(refStack, obj);
    const entries = [];
    let i = 0;
    for (const e of obj) {
      entries[i++] = objectToTokens(e, options, refStack);
    }
    if (options.addBreakTokens) {
      return [
        new Token(Type.array, obj.length),
        entries,
        new Token(Type.break)
      ];
    }
    return [
      new Token(Type.array, obj.length),
      entries
    ];
  },
  Object(obj, typ, options, refStack) {
    const isMap = typ !== "Object";
    const keys = isMap ? obj.keys() : Object.keys(obj);
    const length = isMap ? obj.size : keys.length;
    if (!length) {
      if (options.addBreakTokens === true) {
        return [
          simpleTokens.emptyMap,
          new Token(Type.break)
        ];
      }
      return simpleTokens.emptyMap;
    }
    refStack = Ref.createCheck(refStack, obj);
    const entries = [];
    let i = 0;
    for (const key of keys) {
      entries[i++] = [
        objectToTokens(key, options, refStack),
        objectToTokens(isMap ? obj.get(key) : obj[key], options, refStack)
      ];
    }
    sortMapEntries(entries, options);
    if (options.addBreakTokens) {
      return [
        new Token(Type.map, length),
        entries,
        new Token(Type.break)
      ];
    }
    return [
      new Token(Type.map, length),
      entries
    ];
  }
};
typeEncoders.Map = typeEncoders.Object;
typeEncoders.Buffer = typeEncoders.Uint8Array;
for (const typ of "Uint8Clamped Uint16 Uint32 Int8 Int16 Int32 BigUint64 BigInt64 Float32 Float64".split(" ")) {
  typeEncoders[`${typ}Array`] = typeEncoders.DataView;
}
var DONE = Symbol.for("DONE");
var BREAK = Symbol.for("BREAK");
function encodedLength(data, options) {
  options = Object.assign({}, defaultEncodeOptions2, options);
  options.mapSorter = undefined;
  const tokens = objectToTokens(data, options);
  return tokensToLength(tokens, cborEncoders2, options);
}
function tokensToLength(tokens, encoders = cborEncoders2, options = defaultEncodeOptions2) {
  if (Array.isArray(tokens)) {
    let len = 0;
    for (const token13 of tokens) {
      len += tokensToLength(token13, encoders, options);
    }
    return len;
  } else {
    const encoder = encoders[tokens.type.major];
    if (encoder.encodedSize === undefined || typeof encoder.encodedSize !== "function") {
      throw new Error(`Encoder for ${tokens.type.name} does not have an encodedSize()`);
    }
    return encoder.encodedSize(tokens, options);
  }
}
var cborEncoders2 = makeCborEncoders();
var defaultEncodeOptions2 = {
  float64: false,
  quickEncodeToken
};
function isApprovedVersion(param) {
  return APPROVED_VERSIONS.includes(param);
}
var B1 = "b1";
var B2 = "b2";
var DEFAULT_VERSION = B2;
var APPROVED_VERSIONS = [B1, B2];
function validateExchangeURL(urlString) {
  const url = new URL(urlString, "https://webbundle.example/");
  if (url.username !== "" || url.password !== "") {
    throw new Error("Exchange URL must not have credentials: " + urlString);
  }
  if (url.hash !== "") {
    throw new Error("Exchange URL must not have a hash: " + urlString);
  }
}
function byteString(s) {
  return new TextEncoder().encode(s);
}
function isHeaders(obj) {
  if (typeof obj !== "object") {
    return false;
  }
  for (const value of Object.values(obj)) {
    if (typeof value !== "string") {
      return false;
    }
  }
  return true;
}
function combineHeadersForUrl(headers, overrideHeadersOption, url) {
  if (!overrideHeadersOption)
    return headers;
  const headersForUrl = typeof overrideHeadersOption == "function" ? overrideHeadersOption(url) : overrideHeadersOption;
  if (!isHeaders(headersForUrl)) {
    throw new Error("Malformatted override headers: They should be an object of strings.");
  }
  return { ...headers, ...headersForUrl };
}

class BundleBuilder {
  sectionLengths = [];
  sections = [];
  responses = [];
  currentResponsesOffset = 0;
  compatAdapter;
  constructor(formatVersion = DEFAULT_VERSION) {
    if (!isApprovedVersion(formatVersion)) {
      throw new Error(`Invalid webbundle format version`);
    }
    this.compatAdapter = this.createCompatAdapter(formatVersion);
  }
  createBundle() {
    this.compatAdapter.onCreateBundle();
    this.addSection("index", this.fixupIndex());
    this.addSection("responses", this.responses);
    const wbn = encode(this.createTopLevel());
    const view = new DataView(wbn.buffer, wbn.byteOffset + wbn.length - 8);
    view.setUint32(0, Math.floor(wbn.length / 4294967296));
    view.setUint32(4, wbn.length & 4294967295);
    return wbn;
  }
  addExchange(url, status, headers, payload) {
    validateExchangeURL(url);
    if (typeof payload === "string") {
      payload = byteString(payload);
    }
    this.addIndexEntry(url, this.addResponse(new HeaderMap(status, headers), payload));
    return this;
  }
  setPrimaryURL(url) {
    return this.compatAdapter.setPrimaryURL(url);
  }
  setManifestURL(url) {
    return this.compatAdapter.setManifestURL(url);
  }
  addSection(name, content) {
    if (this.sectionLengths.some((s) => s.name === name)) {
      throw new Error("Duplicated section: " + name);
    }
    let length3 = encodedLength(content);
    this.sectionLengths.push({ name, length: length3 });
    this.sections.push(content);
  }
  addResponse(headerMap, payload) {
    if (payload.length > 0 && !headerMap.has("content-type")) {
      throw new Error("Non-empty exchange must have Content-Type header");
    }
    const response = [headerMap.toCBOR(), payload];
    this.responses.push(response);
    return encodedLength(response);
  }
  addIndexEntry(url, responseLength) {
    this.compatAdapter.setIndexEntry(url, responseLength);
    this.currentResponsesOffset += responseLength;
  }
  fixupIndex() {
    const responsesHeaderSize = encodedLength(this.responses.length);
    return this.compatAdapter.updateIndexValues(responsesHeaderSize);
  }
  createTopLevel() {
    return this.compatAdapter.createTopLevel();
  }
  get formatVersion() {
    return this.compatAdapter.formatVersion;
  }
  createCompatAdapter(formatVersion) {
    if (formatVersion === B1) {
      return new class {
        bundleBuilder;
        formatVersion = B1;
        index = new Map;
        primaryURL = null;
        constructor(bundleBuilder) {
          this.bundleBuilder = bundleBuilder;
        }
        onCreateBundle() {
          if (this.primaryURL === null) {
            throw new Error("Primary URL is not set");
          }
          if (!this.index.has(this.primaryURL)) {
            throw new Error(`Exchange for primary URL (${this.primaryURL}) does not exist`);
          }
        }
        setPrimaryURL(url) {
          if (this.primaryURL !== null) {
            throw new Error("Primary URL is already set");
          }
          validateExchangeURL(url);
          this.primaryURL = url;
          return this.bundleBuilder;
        }
        setManifestURL(url) {
          validateExchangeURL(url);
          this.bundleBuilder.addSection("manifest", url);
          return this.bundleBuilder;
        }
        setIndexEntry(url, responseLength) {
          this.index.set(url, [
            new Uint8Array(0),
            this.bundleBuilder.currentResponsesOffset,
            responseLength
          ]);
        }
        updateIndexValues(responsesHeaderSize) {
          for (const value of this.index.values()) {
            value[1] += responsesHeaderSize;
          }
          return this.index;
        }
        createTopLevel() {
          const sectionLengths = [];
          for (const s of this.bundleBuilder.sectionLengths) {
            sectionLengths.push(s.name, s.length);
          }
          return [
            byteString("\uD83C\uDF10\uD83D\uDCE6"),
            byteString(`${formatVersion}\x00\x00`),
            this.primaryURL,
            encode(sectionLengths),
            this.bundleBuilder.sections,
            new Uint8Array(8)
          ];
        }
      }(this);
    } else {
      return new class {
        bundleBuilder;
        formatVersion = B2;
        index = new Map;
        constructor(bundleBuilder) {
          this.bundleBuilder = bundleBuilder;
        }
        onCreateBundle() {}
        setPrimaryURL(url) {
          validateExchangeURL(url);
          this.bundleBuilder.addSection("primary", url);
          return this.bundleBuilder;
        }
        setManifestURL(url) {
          throw new Error("setManifestURL(): wrong format version");
        }
        setIndexEntry(url, responseLength) {
          this.index.set(url, [
            this.bundleBuilder.currentResponsesOffset,
            responseLength
          ]);
        }
        updateIndexValues(responsesHeaderSize) {
          for (const value of this.index.values()) {
            value[0] += responsesHeaderSize;
          }
          return this.index;
        }
        createTopLevel() {
          const sectionLengths = [];
          for (const s of this.bundleBuilder.sectionLengths) {
            sectionLengths.push(s.name, s.length);
          }
          return [
            byteString("\uD83C\uDF10\uD83D\uDCE6"),
            byteString(`${formatVersion}\x00\x00`),
            encode(sectionLengths),
            this.bundleBuilder.sections,
            new Uint8Array(8)
          ];
        }
      }(this);
    }
  }
}

class HeaderMap extends Map {
  constructor(status, headers) {
    super();
    if (status < 100 || status > 999) {
      throw new Error("Invalid status code");
    }
    this.set(":status", status.toString());
    for (const key of Object.keys(headers)) {
      this.set(key.toLowerCase(), headers[key]);
    }
  }
  toCBOR() {
    const m = new Map;
    for (const [key, value] of this.entries()) {
      m.set(byteString(key), byteString(value));
    }
    return encode(m);
  }
}
var import_read = __toESM(require_read(), 1);
var SignatureType;
(function(SignatureType2) {
  SignatureType2[SignatureType2["Ed25519"] = 0] = "Ed25519";
  SignatureType2[SignatureType2["EcdsaP256SHA256"] = 1] = "EcdsaP256SHA256";
})(SignatureType || (SignatureType = {}));
var PUBLIC_KEY_ATTRIBUTE_NAME_MAPPING = new Map([
  [SignatureType.Ed25519, "ed25519PublicKey"],
  [SignatureType.EcdsaP256SHA256, "ecdsaP256SHA256PublicKey"]
]);
var INTEGRITY_BLOCK_MAGIC = new Uint8Array([
  240,
  159,
  150,
  139,
  240,
  159,
  147,
  166
]);
var VERSION_B1 = new Uint8Array([49, 98, 0, 0]);
var VERSION_B2 = new Uint8Array([50, 98, 0, 0]);
function maybeGetSignatureType(key) {
  switch (key.algorithm.name) {
    case "Ed25519":
      return SignatureType.Ed25519;
    case "ec":
      if (key.asymmetricKeyDetails?.namedCurve === "prime256v1") {
        return SignatureType.EcdsaP256SHA256;
      }
      break;
    default:
      break;
  }
  return null;
}
function isAsymmetricKeyTypeSupported(key) {
  return maybeGetSignatureType(key) !== null;
}
function getSignatureType(key) {
  const signatureType = maybeGetSignatureType(key);
  assert(signatureType !== null, 'Expected either "Ed25519" or "ECDSA P-256" key.');
  return signatureType;
}
function getPublicKeyAttributeName(key) {
  return PUBLIC_KEY_ATTRIBUTE_NAME_MAPPING.get(getSignatureType(key));
}
async function getRawPublicKey(publicKey) {
  const exportedKey = await webcrypto.subtle.exportKey("spki", publicKey);
  switch (getSignatureType(publicKey)) {
    case SignatureType.Ed25519:
      return new Uint8Array(exportedKey).subarray(-32);
    case SignatureType.EcdsaP256SHA256: {
      const uncompressedKey = exportedKey.subarray(-65);
      const compressedKey = crypto.ECDH.convertKey(uncompressedKey, "prime256v1", undefined, undefined, "compressed");
      return new Uint8Array(compressedKey);
    }
  }
}
function checkIsValidKey(expectedKeyType, key) {
  if (key.type !== "public") {
    throw new Error(`Expected key type to be ${expectedKeyType}, but it was "${key.type}".`);
  }
  if (!isAsymmetricKeyTypeSupported(key)) {
    throw new Error(`Expected either "Ed25519" or "ECDSA P-256" key.`);
  }
}
function convertToAdditionalInfo(b) {
  switch (b & 31) {
    case 24:
      return AdditionalInfo.OneByte;
    case 25:
      return AdditionalInfo.TwoBytes;
    case 26:
      return AdditionalInfo.FourBytes;
    case 27:
      return AdditionalInfo.EightBytes;
    case 28:
    case 29:
    case 30:
      throw new Error("Reserved is not used in deterministic CBOR.");
    case 31:
      throw new Error("Indefinite is not used in deterministic CBOR.");
    default:
      return AdditionalInfo.Direct;
  }
}
function getAdditionalInfoDirectValue(b) {
  return b & 31;
}
function getAdditionalInfoLength(info) {
  switch (info) {
    case AdditionalInfo.Direct:
      return 0;
    case AdditionalInfo.OneByte:
      return 1;
    case AdditionalInfo.TwoBytes:
      return 2;
    case AdditionalInfo.FourBytes:
      return 4;
    case AdditionalInfo.EightBytes:
      return 8;
    default:
      throw new Error(`${info} is not supported.`);
  }
}
function getAdditionalInfoValueLowerLimit(info) {
  switch (info) {
    case AdditionalInfo.Direct:
      return 0n;
    case AdditionalInfo.OneByte:
      return 24n;
    case AdditionalInfo.TwoBytes:
      return 256n;
    case AdditionalInfo.FourBytes:
      return 65536n;
    case AdditionalInfo.EightBytes:
      return 4294967296n;
    default:
      throw new Error(`Invalid additional information value: ${info}`);
  }
}
var AdditionalInfo;
(function(AdditionalInfo2) {
  AdditionalInfo2[AdditionalInfo2["Direct"] = 0] = "Direct";
  AdditionalInfo2[AdditionalInfo2["OneByte"] = 1] = "OneByte";
  AdditionalInfo2[AdditionalInfo2["TwoBytes"] = 2] = "TwoBytes";
  AdditionalInfo2[AdditionalInfo2["FourBytes"] = 3] = "FourBytes";
  AdditionalInfo2[AdditionalInfo2["EightBytes"] = 4] = "EightBytes";
  AdditionalInfo2[AdditionalInfo2["Reserved"] = 5] = "Reserved";
  AdditionalInfo2[AdditionalInfo2["Indefinite"] = 6] = "Indefinite";
})(AdditionalInfo || (AdditionalInfo = {}));
function getMajorType(b) {
  return (b & 255) >> 5;
}
var MajorType;
(function(MajorType2) {
  MajorType2[MajorType2["PosInt"] = 0] = "PosInt";
  MajorType2[MajorType2["NegInt"] = 1] = "NegInt";
  MajorType2[MajorType2["ByteString"] = 2] = "ByteString";
  MajorType2[MajorType2["Text"] = 3] = "Text";
  MajorType2[MajorType2["Array"] = 4] = "Array";
  MajorType2[MajorType2["Map"] = 5] = "Map";
  MajorType2[MajorType2["Tag"] = 6] = "Tag";
  MajorType2[MajorType2["Other"] = 7] = "Other";
})(MajorType || (MajorType = {}));
function checkDeterministic(input) {
  let index = 0;
  while (index < input.length) {
    index += deterministicRec(input, index);
  }
  if (index > input.length) {
    throw new Error(`Last CBOR item was incomplete. Index ${index} out of bounds of input of length ${input.length}`);
  }
}
function deterministicRec(input, index) {
  const b = input[index];
  switch (getMajorType(b)) {
    case MajorType.PosInt:
      const { lengthInBytes } = unsignedIntegerDeterministic(input, index);
      return lengthInBytes + 1;
    case MajorType.ByteString:
    case MajorType.Text:
      return textOrByteStringDeterministic(input, index) + 1;
    case MajorType.Array:
      return arrayDeterministic(input, index);
    case MajorType.Map:
      return mapDeterministic(input, index);
    default:
      throw new Error("Missing implementation for a major type.");
  }
}
function unsignedIntegerDeterministic(input, index) {
  const info = convertToAdditionalInfo(input[index]);
  const lengthInBytes = getAdditionalInfoLength(info);
  const value = getUnsignedIntegerValue(input.slice(index, index + lengthInBytes + 1), info);
  if (value < getAdditionalInfoValueLowerLimit(info)) {
    throw new Error(`${value} should not be represented with ${lengthInBytes} bytes in deterministic CBOR.`);
  }
  return { lengthInBytes, value };
}
function getUnsignedIntegerValue(input, info) {
  const offset = 1;
  switch (info) {
    case AdditionalInfo.Direct:
      return BigInt(getAdditionalInfoDirectValue(input[0]));
    case AdditionalInfo.OneByte:
      return BigInt(Buffer.from(input).readUInt8(offset));
    case AdditionalInfo.TwoBytes:
      return BigInt(Buffer.from(input).readUInt16BE(offset));
    case AdditionalInfo.FourBytes:
      return BigInt(Buffer.from(input).readUInt32BE(offset));
    case AdditionalInfo.EightBytes:
      return Buffer.from(input).readBigUInt64BE(offset);
    default:
      throw new Error(`${info} is not supported.`);
  }
}
function textOrByteStringDeterministic(input, index) {
  const { lengthInBytes, value } = unsignedIntegerDeterministic(input, index);
  const totalLength = lengthInBytes + Number(value);
  if (totalLength >= input.length - index) {
    throw new Error("Text or byte string's length cannot exceed the number of bytes left on the input array.");
  }
  return totalLength;
}
function arrayDeterministic(input, index) {
  const { lengthInBytes, value } = unsignedIntegerDeterministic(input, index);
  let startIndexOfNextElement = index + 1 + lengthInBytes;
  for (var i = 0;i < Number(value); i++) {
    if (startIndexOfNextElement >= input.length) {
      throw new Error("Number of items on CBOR array is less than the number of items it claims.");
    }
    startIndexOfNextElement += deterministicRec(input, startIndexOfNextElement);
  }
  return startIndexOfNextElement - index;
}
function mapDeterministic(input, index) {
  const { lengthInBytes, value } = unsignedIntegerDeterministic(input, index);
  let startIndexOfNextElement = index + 1 + lengthInBytes;
  let lastSeenKey = new Uint8Array;
  for (var mapItemIndex = 0;mapItemIndex < Number(value) * 2; mapItemIndex++) {
    if (startIndexOfNextElement >= input.length) {
      throw new Error("Number of items on CBOR map is less than the number of items it claims.");
    }
    const itemLength = deterministicRec(input, startIndexOfNextElement);
    if (mapItemIndex % 2 == 0) {
      const keyCborBytes = input.slice(startIndexOfNextElement, startIndexOfNextElement + itemLength);
      const ordering = Buffer.compare(lastSeenKey, keyCborBytes);
      if (ordering == 0) {
        throw new Error("CBOR map contains duplicate keys.");
      } else if (ordering > 0) {
        throw new Error("CBOR map keys are not in lexicographical order.");
      }
      lastSeenKey = keyCborBytes;
    }
    startIndexOfNextElement += itemLength;
  }
  return startIndexOfNextElement - index;
}

class IntegrityBlockSigner {
  is_v2;
  webBundle;
  webBundleId;
  signingStrategies;
  constructor(is_v2, webBundle, webBundleId, signingStrategies) {
    this.is_v2 = is_v2;
    this.webBundle = webBundle;
    this.webBundleId = webBundleId;
    this.signingStrategies = signingStrategies;
  }
  async sign() {
    const integrityBlock = this.obtainIntegrityBlock().integrityBlock;
    if (this.is_v2) {
      integrityBlock.setWebBundleId(this.webBundleId);
    }
    const signatures = new Array;
    for (const signingStrategy of this.signingStrategies) {
      const publicKey = await signingStrategy.getPublicKey();
      checkIsValidKey("public", publicKey);
      const newAttributes = {
        [getPublicKeyAttributeName(publicKey)]: await getRawPublicKey(publicKey)
      };
      const ibCbor = integrityBlock.toCBOR();
      const attrCbor = encode(newAttributes);
      checkDeterministic(ibCbor);
      checkDeterministic(attrCbor);
      const dataToBeSigned = this.generateDataToBeSigned(this.calcWebBundleHash(), ibCbor, attrCbor);
      const signature = await signingStrategy.sign(dataToBeSigned);
      await this.verifySignature(dataToBeSigned, signature, publicKey);
      signatures.push({
        signature,
        signatureAttributes: newAttributes
      });
    }
    for (const signature of signatures) {
      integrityBlock.addIntegritySignature(signature);
    }
    const signedIbCbor = integrityBlock.toCBOR();
    checkDeterministic(signedIbCbor);
    return {
      integrityBlock: signedIbCbor,
      signedWebBundle: new Uint8Array(Buffer.concat([signedIbCbor, this.webBundle]))
    };
  }
  readWebBundleLength() {
    let buffer2 = Buffer.from(this.webBundle.slice(-8));
    return Number(buffer2.readBigUint64BE());
  }
  obtainIntegrityBlock() {
    const webBundleLength = this.readWebBundleLength();
    if (webBundleLength !== this.webBundle.length) {
      throw new Error("IntegrityBlockSigner: Re-signing signed bundles is not supported yet.");
    }
    return { integrityBlock: new IntegrityBlock(this.is_v2), offset: 0 };
  }
  calcWebBundleHash() {
    var hash = crypto2.createHash("sha512");
    var data = hash.update(this.webBundle);
    return new Uint8Array(data.digest());
  }
  generateDataToBeSigned(webBundleHash, integrityBlockCborBytes, newAttributesCborBytes) {
    const dataParts = [
      webBundleHash,
      integrityBlockCborBytes,
      newAttributesCborBytes
    ];
    const bigEndianNumLength = 8;
    const totalLength = dataParts.reduce((previous, current) => {
      return previous + current.length;
    }, dataParts.length * bigEndianNumLength);
    let buffer2 = Buffer.alloc(totalLength);
    let offset = 0;
    dataParts.forEach((d) => {
      buffer2.writeBigInt64BE(BigInt(d.length), offset);
      offset += bigEndianNumLength;
      Buffer.from(d).copy(buffer2, offset);
      offset += d.length;
    });
    return new Uint8Array(buffer2);
  }
  async verifySignature(data, signature, publicKey) {
    const algorithm = { name: "Ed25519" };
    const isVerified = await webcrypto.subtle.verify(algorithm, publicKey, signature, data);
    if (!isVerified) {
      throw new Error("IntegrityBlockSigner: Signature cannot be verified. Your keys might be corrupted or not corresponding each other.");
    }
  }
}

class IntegrityBlock {
  is_v2;
  attributes = new Map;
  signatureStack = [];
  constructor(is_v2 = false) {
    this.is_v2 = is_v2;
  }
  setWebBundleId(webBundleId) {
    if (!this.is_v2) {
      throw new Error("setWebBundleId() is only available for v2 integrity blocks.");
    }
    this.attributes.set("webBundleId", webBundleId);
  }
  addIntegritySignature(is3) {
    this.signatureStack.push(is3);
  }
  toCBOR() {
    if (this.is_v2) {
      return encode([
        INTEGRITY_BLOCK_MAGIC,
        VERSION_B2,
        this.attributes,
        this.signatureStack.map((integritySig) => {
          return [integritySig.signatureAttributes, integritySig.signature];
        })
      ]);
    } else {
      return encode([
        INTEGRITY_BLOCK_MAGIC,
        VERSION_B1,
        this.signatureStack.map((integritySig) => {
          return [integritySig.signatureAttributes, integritySig.signature];
        })
      ]);
    }
  }
}

class WebBundleId {
  TYPE_SUFFIX_MAPPING = new Map([
    [SignatureType.Ed25519, [0, 1, 2]],
    [SignatureType.EcdsaP256SHA256, [0, 2, 2]]
  ]);
  scheme = "isolated-app://";
  key;
  typeSuffix;
  constructor(key) {
    if (!isAsymmetricKeyTypeSupported(key)) {
      throw new Error(`WebBundleId: Only Ed25519 and ECDSA P-256 keys are currently supported.`);
    }
    if (key.type === "private") {
      this.key = crypto3.createPublicKey(key);
    } else {
      this.key = key;
    }
    this.typeSuffix = this.TYPE_SUFFIX_MAPPING.get(getSignatureType(this.key));
  }
  async serialize() {
    return base32Encode(new Uint8Array([...await getRawPublicKey(this.key), ...this.typeSuffix]), "RFC4648", { padding: false }).toLowerCase();
  }
  async serializeWithIsolatedWebAppOrigin() {
    return `${this.scheme}${await this.serialize()}/`;
  }
  async toString() {
    return `  Web Bundle ID: ${await this.serialize()}
  Isolated Web App Origin: ${await this.serializeWithIsolatedWebAppOrigin()}`;
  }
}
function headerNamesToLowerCase(headers) {
  const lowerCaseHeaders = {};
  for (const [headerName, headerValue] of Object.entries(headers)) {
    lowerCaseHeaders[headerName.toLowerCase()] = headerValue;
  }
  return lowerCaseHeaders;
}
function checkAndAddIwaHeaders(headers) {
  const lowerCaseHeaders = headerNamesToLowerCase(headers);
  for (const [iwaHeaderName, iwaHeaderValue] of Object.entries(iwaHeaderDefaults)) {
    if (!lowerCaseHeaders[iwaHeaderName]) {
      console.log(`For Isolated Web Apps, ${iwaHeaderName} header was automatically set to ${iwaHeaderValue}. ${ifNotIwaMsg}`);
      headers[iwaHeaderName] = iwaHeaderValue;
    }
  }
  for (const [iwaHeaderName, iwaHeaderValue] of Object.entries(invariableIwaHeaders)) {
    if (lowerCaseHeaders[iwaHeaderName] && lowerCaseHeaders[iwaHeaderName].toLowerCase() !== iwaHeaderValue) {
      throw new Error(`For Isolated Web Apps ${iwaHeaderName} should be ${iwaHeaderValue}. Now it is ${headers[iwaHeaderName]}. ${ifNotIwaMsg}`);
    }
  }
}
/*!
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var coep = Object.freeze({
  "cross-origin-embedder-policy": "require-corp"
});
var coop = Object.freeze({
  "cross-origin-opener-policy": "same-origin"
});
var corp = Object.freeze({
  "cross-origin-resource-policy": "same-origin"
});
var CSP_HEADER_NAME = "content-security-policy";
var csp = Object.freeze({
  [CSP_HEADER_NAME]: "base-uri 'none'; default-src 'self'; object-src 'none'; frame-src 'self' https: blob: data:; connect-src 'self' https: wss:; script-src 'self' 'wasm-unsafe-eval'; img-src 'self' https: blob: data:; media-src 'self' https: blob: data:; font-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; require-trusted-types-for 'script'; frame-ancestors 'self';"
});
var invariableIwaHeaders = Object.freeze({
  ...coep,
  ...coop,
  ...corp
});
var iwaHeaderDefaults = Object.freeze({
  ...csp,
  ...invariableIwaHeaders
});
var ifNotIwaMsg = "If you are bundling a non-IWA, set `integrityBlockSign: { isIwa: false }` in the plugin's configuration.";
function addAsset(builder, baseURL, relativeAssetPath, assetContentBuffer, pluginOptions) {
  const parsedAssetPath = path.parse(relativeAssetPath);
  const isIndexHtmlFile = parsedAssetPath.base === "index.html";
  const shouldCheckIwaHeaders = typeof pluginOptions.headerOverride === "function" && "integrityBlockSign" in pluginOptions && pluginOptions.integrityBlockSign.isIwa;
  if (isIndexHtmlFile) {
    const combinedIndexHeaders = combineHeadersForUrl({ Location: "./" }, pluginOptions.headerOverride, baseURL + relativeAssetPath);
    if (shouldCheckIwaHeaders)
      checkAndAddIwaHeaders(combinedIndexHeaders);
    builder.addExchange(baseURL + relativeAssetPath, 301, combinedIndexHeaders, "");
  }
  const baseURLWithAssetPath = baseURL + (isIndexHtmlFile ? parsedAssetPath.dir : relativeAssetPath);
  const combinedHeaders = combineHeadersForUrl({
    "Content-Type": src_default.getType(relativeAssetPath) || "application/octet-stream"
  }, pluginOptions.headerOverride, baseURLWithAssetPath);
  if (shouldCheckIwaHeaders)
    checkAndAddIwaHeaders(combinedHeaders);
  builder.addExchange(baseURLWithAssetPath, 200, combinedHeaders, assetContentBuffer);
}
function addFilesRecursively(builder, baseURL, dir, pluginOptions, recPath = "") {
  const files = fs.readdirSync(dir);
  files.sort();
  for (const fileName of files) {
    const filePath = path.join(dir, fileName);
    if (fs.statSync(filePath).isDirectory()) {
      addFilesRecursively(builder, baseURL, filePath, pluginOptions, recPath + fileName + "/");
    } else {
      const fileContent = fs.readFileSync(filePath);
      addAsset(builder, baseURL, recPath + fileName, fileContent, pluginOptions);
    }
  }
}
async function getSignedWebBundle(webBundle, opts, infoLogger2) {
  const { signedWebBundle } = await new IntegrityBlockSigner(true, webBundle, opts.integrityBlockSign.webBundleId, opts.integrityBlockSign.strategies).sign();
  infoLogger2(opts.baseURL);
  return signedWebBundle;
}
/*!
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*!
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function bundleIsolatedWebApp(opts) {
  const builder = new BundleBuilder(opts.formatVersion);
  if ("primaryURL" in opts && opts.primaryURL) {
    builder.setPrimaryURL(opts.primaryURL);
  }
  if (opts.static) {
    addFilesRecursively(builder, opts.static.baseURL ?? opts.baseURL, opts.static.dir, opts);
  }
  let webBundle = builder.createBundle();
  if ("integrityBlockSign" in opts) {
    webBundle = await getSignedWebBundle(webBundle, opts, infoLogger);
  }
  return {
    fileName: opts.output,
    source: webBundle
  };
}
var consoleLogColor = { green: "\x1B[32m", reset: "\x1B[0m" };
function infoLogger(text) {
  console.log(`${consoleLogColor.green}${text}${consoleLogColor.reset}
`);
}
export {
  bundleIsolatedWebApp,
  WebBundleId
};
