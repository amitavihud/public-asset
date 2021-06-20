
try {
    const isPublished = window.autopilot.isPublishedRevision

    const {
        componentId, text
     } = window.autopilot.payload

    documentServices.components.data.update(
        {id: componentId, type: 'DESKTOP'},
        {text: `<h3 class="font_5">${text}</h3>`}
    )
    
    window.autopilot.reportResult(
        `This was a simple script migration on the ${isPublished ? 'published' : 'last saved'} revision`
    )
} catch (e) {
    window.autopilot.reportError(e)
}

