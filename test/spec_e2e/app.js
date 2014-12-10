describe('The application', function() {
   
    var PAGE_TITLE = 'POI Tour - Personalisierter Tourenplaner für Fussgänger';
    
    beforeEach(function() {
        browser.get('/');
        browser.sleep(2000);
    });

    it('should have the correct title', function() {
        expect(browser.getTitle()).toEqual(PAGE_TITLE);
    });
    
    
    it('typical loop tour scenario', function() {
        calcTour('Zürich HB');
        
        waitForCalc(function() {
            expect($$('.awesome-marker-icon-blue').count()).toBeGreaterThan(0);
            expect($('.alert-success').isDisplayed()).toBeTruthy();
            
            $$('.awesome-marker-icon-blue').get(0).click();
            expect($('pt-flickr-location-carousel').isPresent()).toBeTruthy();
            
        });
    });
    
    
    it('typical A-B tour scenario', function() {
        calcTour('Zürich HB', 'Bellevue, Zürich');
        
        waitForCalc(function() {
            expect($$('.awesome-marker-icon-blue').count()).toBeGreaterThan(0);
            expect($$('.awesome-marker-icon-red').count()).toBeGreaterThan(1);
            expect($('.alert-success').isDisplayed()).toBeTruthy();
        });
    });
    
    
    it('A-B distance too big scenario', function() {
        calcTour('Zürich HB', 'Willisau, Luzern');
        
        waitForCalc(function() {
            expect($$('.awesome-marker-icon-blue').count()).toBe(0);
            expect($$('.awesome-marker-icon-red').count()).toBeGreaterThan(1);
            expect($('.alert-success').isDisplayed()).toBeFalsy();
            expect($('.alert-warning').isDisplayed()).toBeTruthy();
        });
    });
    
    
    it('No POIs scenario', function() {
        // some forest
        calcTour('47.51737,8.39201');
        
        waitForCalc(function() {
            expect($$('.awesome-marker-icon-blue').count()).toBe(0);
            expect($$('.awesome-marker-icon-red').count()).toBe(1);
            expect($('.alert-success').isDisplayed()).toBeFalsy();
            expect($('.alert-warning').isDisplayed()).toBeTruthy();
        });
    });
    
});


var waitForCalc = function(cb) {
    browser.wait(function() {
        return $('.blockUI').isPresent().then(function(is) {
            return !is;
        });
    }).then(cb);
};


var calcTour = function(start, end) {
    element(by.model('fc.tour.start')).sendKeys(start);
    if(end) {
        element(by.model('fc.tour.end')).sendKeys(end);
    }
    $('#calc-tour').click(); 
};
