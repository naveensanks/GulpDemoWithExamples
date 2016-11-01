describe("font loader Test", function () {

    describe("when method is called to get time out value", function () {
        it("should return a value of 2000", function () {
            expect(getTimeoutValue()).toEqual(2000);
        });
    });
});