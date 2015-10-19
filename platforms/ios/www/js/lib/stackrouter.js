"use strict";

(function(Backbone, _, $) {

    Backbone.StackRouter = Backbone.Router.extend({
        initialize: function() {
            // Keep track of the history of pages (we only store the page URL). Used to identify the direction
            // (left or right) of the sliding transition between pages.
            this.pageHistory = [];
        },

        getLastPage: function() {
            return (this.pageHistory != null && this.pageHistory.length > 1 ? this.pageHistory[this.pageHistory.length - 2] : "main");
        },

        slidePage: function(view) {
            var page = view.render();
            console.log("+ Navigating to [" + view.name + "]");
            var slideFrom,
            that = this;

            if (!this.currentPage) {
                // If there is no current page (app just started) -> No transition: Position new page in the view port
                $(page.el).attr('class', 'page stage-center');
                $('#content').append(page.el);
                this.pageHistory = [view.name];
                this.currentPage = page;
                return;
            }

            if (view.name === "main") {
                // Always apply a Back (slide from left) transition when we go back to the main page
                slideFrom = "left";
                $(page.el).attr('class', 'page transition stage-left');
                // Reinitialize page history
                this.pageHistory = ["main"];
            } 
            else if (this.pageHistory.length > 1 && view.name === this.pageHistory[this.pageHistory.length - 2]) {
                // The new page is the same as the previous page -> Back transition
                slideFrom = "left";
                $(page.el).attr('class', 'page transition stage-left');
                this.pageHistory.pop();
            } 
            else {
                // Forward transition (slide from right)
                slideFrom = "right";
                $(page.el).attr('class', 'page transition stage-right');
                // don't push duplicate pages
                if (this.pageHistory[this.pageHistory.length - 1] !== view.name) {
                    this.pageHistory.push(view.name);
                }
            }

            $('#content').append(page.el);

            // Wait until the new page has been added to the DOM...
            setTimeout(function() {
                // Slide out the current page: If new page slides from the right -> slide current page to the left, and vice versa
                $(that.currentPage.el).attr('class', 'page transition ' + (slideFrom === "right" ? 'stage-left' : 'stage-right'));
                // Slide in the new page
                $(page.el).attr('class', 'page stage-center transition');
                that.currentPage = page;
            }, 10);

        }
    });

})(Backbone, _,  $);
