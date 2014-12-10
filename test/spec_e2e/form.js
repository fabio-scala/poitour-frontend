describe('Form', function() {
    
    var HOURS_VALID = [0, 6],
        HOURS_INVALID = ['a', -1, 7];
    
    var MINUTES_VALID = [0, 1, 59],
        MINUTES_INVALID = ['a', -1, 60];
    
    var START_VALID = ['Hochschule für Technik Rapperswil'],
        START_INVALID = ['123 location that will never ever exist 123'];
    
    var END_VALID = START_VALID.concat(''),
        END_INVALID = START_INVALID;
    

    beforeEach(function() {
        browser.get('/');
        browser.sleep(2000);
    });

    // no longer valid
    xit('should have an initially disabled submit button', function() {
        expect(element(by.id('calc-tour')).isEnabled()).toBeFalsy();
    });
    

    it('should initially be valid', function() {
        expect(element.all(by.css('.has-error')).count()).toBe(0);
    });

    it('should correctly validate hours', function() {
        hours = element(by.model('fc.tour.hours'));
        
        checkErrorInput(hours, HOURS_INVALID);
        checkValidInput(hours, HOURS_VALID);

    });
    
    
    it('should correctly validate minutes', function() {
        minutes = element(by.model('fc.tour.minutes'));
        
        checkErrorInput(minutes, MINUTES_INVALID);
        checkValidInput(minutes, MINUTES_VALID);
    });
    
    it('should correctly validate start location', function() {
        start = element(by.model('fc.tour.start'));
        
        checkErrorInput(start, START_INVALID);
        checkValidInput(start, START_VALID);

    });
    
    it('should correctly validate end location', function() {
        end = element(by.model('fc.tour.end'));
        
        checkErrorInput(end, END_INVALID);
        checkValidInput(end, END_VALID);
    });
    
    
    it('should correctly validate empty categories', function() {
        expect(countFormErrors()).toBe(0);
        $$('.selected-category i.fa-close').click();
        expect(countFormErrors()).toBeGreaterThan(0);
    });
    
    it('should show the current location on the map', function() {
        expect($('.awesome-marker .fa-home').isPresent()).toBeFalsy();
        element(by.model('fc.tour.start')).element(by.xpath('..')).$('button').click();
        browser.wait(function() {
            return $('.awesome-marker .fa-home').isPresent();
        }).then(function(val) {
            expect(val).toBeTruthy();
        });
    });
    
    it('should set location by right click on map', function() {
        var tile = $$('.leaflet-tile').get(0);
        
        browser.actions().mouseMove(tile).perform();
        browser.actions().click(protractor.Button.RIGHT).perform();
        
        $$('.leaflet-contextmenu-item').get(0).click();
        
        browser.wait(function() {
            return $('.awesome-marker .fa-home').isPresent();
        }).then(function(val) {
            expect(val).toBeTruthy();
        });
    });
    
});


/**
 * Helper functions
 */
var clear = function(elem, length) {
    // protractor bug https://github.com/angular/protractor/issues/562
    length = length || 100;
    var backspaceSeries = '';
    for(var i = 0; i < length; i++){
        backspaceSeries += protractor.Key.BACK_SPACE;
    }
    elem.sendKeys(backspaceSeries);
};

var countFormErrors = function() {
    return $$('.has-error').count();
};



var checkInput = function(el, inputs, fnValidation) {
    if(!Array.isArray(inputs)) {
        inputs = [inputs];
    }
    
    inputs.forEach(function(input) {
        var prev = el.getText();
        clear(el);
        el.sendKeys(input);
        // simulate blur by clicking something else
        $('#map').click();
        
        fnValidation(el);
        el.sendKeys(prev);
    });
};

var checkErrorInput = function(el, inputs) {
    checkInput(el, inputs, function(el) {
        expect(countFormErrors()).toBeGreaterThan(0);
        expect(el.getAttribute('class')).toContain('ng-invalid');
    });
};

var checkValidInput = function(el, inputs) {
    checkInput(el, inputs, function(el) {
        expect(countFormErrors()).toBe(0);
        expect(el.getAttribute('class')).toContain('ng-valid');
    });
};
