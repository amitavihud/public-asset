
try {
    if (window.autopilotPayload.throwErrorMessage) {
        throw new Error(window.autopilotPayload.throwErrorMessage)
    }

    documentServices.components.data.update(
        {id: window.autopilotPayload.componentId, type: 'DESKTOP'},
        { 
            type: 'StyledText',
            id: 'dataItem-kct1wgzb',
            metaData: { isPreset: false, schemaVersion: 1.0, isHidden: false, pageId: 'c1dmp' },
            text: '<h3 class=\font_3\>' + window.autopilotPayload.value + '</h3>',
            stylesMapId: 'CK_EDITOR_PARAGRAPH_STYLES',
            linkList: [] 
        }
    )
    
    window.autopilotJsonp()
} catch (e) {
    window.autopilotJsonp(e)
}

