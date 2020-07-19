
try {
    if (window.autopilotPayload.throwErrorMessage) {
        throw new Error(window.autopilotPayload.throwErrorMessage)
    }

    const data = documentServices.components.data.get({id: window.autopilotPayload.componentId, type: 'DESKTOP' })
    documentServices.components.data.update(
        {id: window.autopilotPayload.componentId, type: 'DESKTOP'},
        {
            ...data,
            text: '<h3 class=\font_3\>' + window.autopilotPayload.value + '</h3>',
        }
    )
    
    window.autopilotJsonp()
} catch (e) {
    window.autopilotJsonp(e)
}

