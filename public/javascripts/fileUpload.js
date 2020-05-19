
FilePond.registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginImageResize,
  FilePondPluginFileEncode
)

FilePond.setOptions({
  stylePanelAspectRatio: 150 / 100 ,  //1 / coverAspectRatio,
  // imageResizeTargetWidth: 100, //coverWidth,
  // imageResizeTargetHeight: 150 //coverHeight
})

FilePond.parse(document.body);