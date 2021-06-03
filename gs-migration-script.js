
const FORMS_APP_DEF_ID = '14ce1214-b278-a7e4-1373-00cebd1bef7c';
const GET_SUBSCRIBERS_APP_DEF_ID = '1375baa8-8eca-5659-ce9d-455b2009250d';
const MOBILE = 'MOBILE';
const DESKTOP = 'DESKTOP';

const componentApi = documentServices.components;
const generalInfoApi = documentServices.generalInfo;
const layoutApi = componentApi.layout;

const FORMS_PER_MIGRATION = 4;

const messageTypes = {
    REQUEST_FRAME_DATA: 'form-gs-migration',
    RECEIVED_FRAME_DATA: 'gs-frame-data'
}

const activeAutomation = _.get(
    window,
    'autopilot.payload.activeAutomation',
    false,
);
const isPublishedRevision = _.get(window, 'autopilot.isPublishedRevision')

// ** Utils **
const forEachAsync = async (array, cb) => {
    for (let i = 0; i < array.length; i++) {
        await cb(array[i], i, array)
    }
}

// ** DS utils **
const goToMobile = () => {
    documentServices.viewMode.set(MOBILE);
    return waitForDS();
};

const goToDesktop = () => {
    documentServices.viewMode.set(DESKTOP);
    return waitForDS();
};

const waitToFrame = (id) => new Promise(res => {
    if (!frames[id + 'iframe'].contentDocument) {
        console.log('frame ready')
        return res()
    }

    frames[id + 'iframe'].onload = () => {
        console.log('frame loaded')
        res()
    }
})

const navigateToPage = async (pageId) => {
    const isMasterPage = pageId === 'masterPage';
    if (isMasterPage) {
        if (
            documentServices.pages.isLandingPage(
                documentServices.pages.getCurrentPageId(),
            )
        ) {
            const allPages = documentServices.pages.getPagesData();
            /*if (allPages.length === 1) {
              return Promise.resolve();
            }*/
            const nonLandingPage = _.find(allPages, { isLandingPage: false });
            if (nonLandingPage) {
                return navigateToPageImp(nonLandingPage.id);
            }
            throw new Error('cant find form');
        }
        return;
    }
    return navigateToPageImp(pageId);
};

const navigateToPageImp = (pageId) =>
    new Promise((resolve) =>
        documentServices.pages.navigateTo(pageId, () => {
            console.log('navigate-to-', pageId)
            resolve()
        }),
    );

const waitForDS = () =>
    new Promise((resolve) => {
        window.documentServices.waitForChangesApplied(() => resolve());
    });

//RegisterMethod

let promiseResolver;

const postRequest = (id, isDesktop) => frames[id + 'iframe'].contentWindow.postMessage({
    compId: id,
    type: messageTypes.REQUEST_FRAME_DATA,
    isDesktop
}, 'https://gs.wixapps.net')

const getFrameData = async (id, isDesktop) => {
    console.log('Send Request to GS')

    const frameDataPromise = new Promise(res => promiseResolver = res)
    postRequest(id, isDesktop)
    const interval = setInterval(() => {
        console.log('post again')
        postRequest(id, isDesktop)
    }, 3000)
    const frameData = await frameDataPromise;
    clearInterval(interval)

    promiseResolver = null;
    return frameData;
}

//receive Data
addEventListener('message', (event) => {
    const data = event.data;

    if (event.origin !== 'https://gs.wixapps.net' || typeof data !== "object" || data.type !== messageTypes.RECEIVED_FRAME_DATA) {
        return;
    }
    if (!data.dataFromFrame.layouts.button) {
        console.log('retry post')
        setTimeout(() => postRequest(data.compId, data.isDesktop), 200)
    } else {
        console.log('layout received', promiseResolver)
        promiseResolver && promiseResolver(data.dataFromFrame);
    }
}, false)


const excludeFormsWithPopup = (frameData) => {
    return frameData.payload.settings.popup.showPopup
}

const originalSVGSizes = [
    null, null,
    { width: 116, height: 47.87 },//style 2 -  post stamp
    { width: 97, height: 37 }, //style 3 - stamp
    { width: 15, height: 27 }, //style 4 - triangle
]

const fixLayoutBackgroundAndSvg = (data, style) => (states) => {
    states.forEach((stateRef) => {
        const stateLayout = layoutApi.get(stateRef)

        const comps = componentApi.getChildren(stateRef);

        const backgroundRef = comps[0];
        const svgRef = comps[1];
        const backgroundLayout = layoutApi.get(backgroundRef);

        layoutApi.update(backgroundRef, {
            height: stateLayout.height - backgroundLayout.y
        });
        layoutApi.update(svgRef, originalSVGSizes[style]);

        if (style === 4) {
            comps.splice(1, 1); //without svg
            comps.forEach(ref => {
                const layout = layoutApi.get(ref);
                layoutApi.update(ref, { x: layout.x - 5 });
            })
        }
    })
}

const spreadBackgroundHeader = (data) => (states) => {
    const { showSubtitle } = data.payload.settings.signupForm;
    const firstStateRef = states[0];

    const comps = componentApi.getChildren(firstStateRef);

    const backgroundRef = comps[0];

    const backgroundLayout = layoutApi.get(backgroundRef);
    const titleLayout = layoutApi.get(comps[1]);
    const subtitleLayout = showSubtitle && layoutApi.get(comps[2]);

    const lastYS = [titleLayout, subtitleLayout]
        .filter(layout => layout)
        .map(layout => layout.y + layout.height)

    const lastY = Math.max(...lastYS)

    const endOffset = backgroundLayout.y + backgroundLayout.height - lastY;
    const extraOffset = 12 - endOffset;

    layoutApi.update(backgroundRef, {
        height: backgroundLayout.height + extraOffset
    })
}


const convertMethods = (data) => {
    const appStyle = data.payload.settings.style.appStyle;
    if (!data.mobileLayouts) {
        return null
    }
    switch (appStyle) {
        case 0:
            const { showSubtitle, showTitle } = data.payload.settings.signupForm;
            if (!showSubtitle && !showTitle) {
                return null
            }
            return spreadBackgroundHeader(data)
        case 2:
        case 3:
        case 4:
            return fixLayoutBackgroundAndSvg(data, appStyle)
        default:
            return null
    }
}

//for now we will fix the background, in the future we might consider change other component y offsets
const fixBackgroundHeightInMobile = async (getSubscribersData) => {
    const withBoxAsBackgroundZip = getSubscribersData
        .map(data => [data, convertMethods(data)])
        .filter(([_data, converter]) => converter)

    if (withBoxAsBackgroundZip.length === 0) {
        return
    }
    await goToMobile();
    await forEachAsync(withBoxAsBackgroundZip, (async ([migrationData, converter]) => {
        await navigateToPage(migrationData.pageId);
        const componentRef = { id: migrationData.componentRef.id, type: 'MOBILE' };
        const states = componentApi.getChildren(componentApi.getChildren(componentRef)[0]);

        converter(states)
    }))
    //we
    await goToDesktop();
}

let runInPreview = (debug = false, amount = FORMS_PER_MIGRATION, forceMigrateRules = false) => {
    promiseResolver = null;

    const migrateAllForms = async () => {

        //provision forms

        const { documentServices } = window;

        await documentServices.platform.provision(FORMS_APP_DEF_ID);
        const appData = documentServices.tpa.app.getDataByAppDefId(GET_SUBSCRIBERS_APP_DEF_ID) || {};
        const comps = documentServices.tpa.app.getAllCompsByApplicationId(appData.applicationId) || [];
        const totalGSComps = comps.length;
        const slicedComps = comps.slice(0, amount)

        const candidateGS = _.orderBy(
            slicedComps
                .map((form) => ({
                    ...form,
                })),
            ['metaData.pageId'],
            ['asc'],
        );

        console.log('candidateGS', candidateGS)
        let getSubscribersData = []
        //TODO: for each async
        await forEachAsync(candidateGS, (async (form) => {
            let mobileData = null
            await navigateToPage(form.pageId);
            console.log('open desktop')
            await goToDesktop();
            await waitToFrame(form.id);
            const frameData = await getFrameData(form.id, true);

            if (excludeFormsWithPopup(frameData)) {
                throw new Error('popup exists');
            }

            const mobileHints = await componentApi.mobileHints.get({ id: form.id, type: "DESKTOP" });

            if (!mobileHints || !mobileHints.hidden) {
                await goToMobile();
                await waitToFrame(form.id);
                mobileData = await getFrameData(form.id, false)

                await goToDesktop();
                await waitToFrame(form.id);
            }

            const componentRef = componentApi.get.byId(form.id)
            getSubscribersData.push({
                componentRef,
                pageId: form.pageId,
                desktopLayouts: frameData.layouts,
                mobileLayouts: mobileData && mobileData.layouts,
                payload: frameData.payload,
            })
        }));

        const isAllMigrated = getSubscribersData.length === totalGSComps

        if (activeAutomation && !isAllMigrated) {
            throw new Error("Too many forms with automations");
        }

        if (getSubscribersData.length > 0) {
            await documentServices.platform
                .migrate(FORMS_APP_DEF_ID, {
                    getSubscribersMigration: {
                        getSubscribersData,
                        activeAutomation: forceMigrateRules || activeAutomation,
                        isPublishedRevision: forceMigrateRules || isPublishedRevision,
                        debug
                    }
                });
            if (!debug) {
                await fixBackgroundHeightInMobile(getSubscribersData);
            }
        }
        return {
            isAllMigrated
        }
    }

    return migrateAllForms()
}


if (generalInfoApi.isSiteFromOnBoarding()) {
    const shouldMigrateAutomation = isPublishedRevision && activeAutomation;

    setTimeout(() => {
        if (shouldMigrateAutomation) {
            documentServices.platform
                .migrate(FORMS_APP_DEF_ID, {
                    getSubscribersMigration: {
                        activeAutomation,
                        isPublishedRevision,
                    }
                })
                .then(() => {
                    window.autopilot.reportResult();
                });
        } else {
            window.autopilot.reportResult();
        }
    }, 30000);
} else {
    runInPreview(false, FORMS_PER_MIGRATION)
        .then(({
            isAllMigrated
        }) => {
            window.autopilot.reportResult(
                {},
                { reiterate: !isAllMigrated }
            );
        })
        .catch((e) => {
            console.error(e);
            window.autopilot.reportError(_.get(e, 'message'));
        })
}
