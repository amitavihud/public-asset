
try {
    documentServices.components.add(
        {id: 'c1dmp', type: 'DESKTOP'},
        {
            id: 'WRichTextStyleFont1',
            type: 'Component',
            skin: 'wysiwyg.viewer.skins.WRichTextNewSkin',
            layout: {width: 310, height: 65, x: 592.5, y: 135.33333333333334, scale: 1, rotationInDegrees: 0, fixedPosition: false},
            componentType: 'wysiwyg.viewer.components.WRichText',
            data: {
                type: 'StyledText',
                metaData: {isPreset: false, schemaVersion: '1.0', isHidden: false},
                text: `<h3 class="font_3">${JSON.stringify(window.autopilotPayload)}</h3>`,
                stylesMapId: 'CK_EDITOR_PARAGRAPH_STYLES', linkList: []
            },
            style: 'txtNew'
        }
    )
    
    window.autopilotJsonp()
} catch (e) {
    window.autopilotJsonp(e)
}

