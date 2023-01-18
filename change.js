
try {
    const isPublished = window.autopilot.isPublishedRevision

    const componentId = window.autopilot.payload.componentId
    const value = window.autopilot.payload.value

    documentServices.components.data.update(
        { id: componentId, type: 'DESKTOP' }, 
        { text: `<h3 class="font_5">payload.value: ${value} on a ${isPublished ? 'published' : 'saved'} revision</h3>`})
    
    window.autopilot.reportResult(`response from ${isPublished ? 'published' : 'last saved'} revision`)
} catch (e) {
    window.autopilot.reportError(e)
}

