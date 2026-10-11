import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("png");
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setCrf(14);
Config.setAudioCodec("aac");
Config.setAudioBitrate("320k");
Config.setConcurrency(8);
