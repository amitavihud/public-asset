try {
    const isPublished = window.autopilot.isPublishedRevision
    
    if (isPublished) {
    
        const componentId = window.autopilot.payload.componentId
        const value = window.autopilot.payload.value
    
        documentServices.components.data.update({ id: componentId, type: 'DESKTOP' }, { 
            text: `<h3 class="font_5">${value} made by ${window.documentServicesModel.userInfo.email} editorModel.isImpersonated: ${window.parent.editorModel.isImpersonated}</h3>` 
        })
        
        window.autopilot.reportResult(`This was a simple jsonp migration on the ${isPublished ? 'published' : 'last saved'} revision`)
    } else {
        window.autopilot.reportError(new Error('saved migration failed'))
    }
} catch (e) {
    window.autopilot.reportError(e)
}