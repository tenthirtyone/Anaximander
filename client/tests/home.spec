describe("Control Test", function() {
  it("contains spec with an expectation", function() {
    expect(true).toBe(true);
  });
});

describe('Home Controller', function () {
    beforeEach(function () {
        module('Anaximander'); 
    });
  	
    beforeEach(inject(function($controller,$rootScope){
        scope = $rootScope.$new();
        $controller('HomeController as home', {$scope: scope});
    })); 

    var scope;
		
		describe('Max Length', function(){
	    it('Should be 500', function(){
        expect(scope.home.maxLength).toBe(500);
	    });
		}); 
		describe('Functions', function(){
	    it('Has reset, emailStatus, getEmailTemplate, sendEmail functions', function() {
	    	expect(scope.home.reset).toBeDefined();
	    	expect(scope.home.emailStatus).toBeDefined();
	    	expect(scope.home.sendEmail).toBeDefined();
	    })
		}); 
});

describe('HomeService', function(){
    describe('Empty emailStatus', function(){
       beforeEach(module('Anaximander'));

       var HomeService, httpBackend;
       var APIURL = 'http://localhost:3000/api/email';

       beforeEach(inject(function(_HomeService_, $httpBackend){
       	HomeService = _HomeService_;
       	httpBackend = $httpBackend;
       }))

        it('returns an empty string', function(){ //parameter name = service name
        	console.log(HomeService);
          expect(HomeService.getEmailStatus()).toBe('');
        })
        it('Has getEmailStatus, getEmailTemplate, resetEmailStatus, sendEmail functions', function() {
        	expect(HomeService.getEmailStatus).toBeDefined();
        	expect(HomeService.getEmailTemplate).toBeDefined();
        	expect(HomeService.resetEmailStatus).toBeDefined();
        	expect(HomeService.sendEmail).toBeDefined();
        })
        it('Gets a template from the backend', function() {
        	var response = {to: '', from: '', subject: '', text: ''};
        	var email = {};
					httpBackend.expectGET(APIURL).respond(response);
					HomeService.getEmailTemplate()
					.then(function(res) {
						console.log('made it')
					});
        })
    })

});