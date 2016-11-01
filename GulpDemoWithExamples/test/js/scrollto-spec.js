describe("scroll-to Test", function () {

    describe("when method is called to get scroll time value", function () {
        it("should return a value of 3000", function () {
            expect(getScrollTimeValue()).toEqual(3000);
        });
    });
});