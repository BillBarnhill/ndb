describe("NodeDebugger", function() {
  describe("Commands", function() {
    describe("evaluate", function() {
      before_each(function() {
        evaluator = ndb.Commands.Evaluate;

        raw_write = ndb.Commands.RawWrite;
        spy.stub(raw_write, "run");
      });

      describe("running", function() {
        // {"seq":117,"type":"request","command":"evaluate","arguments":{"expression":"1+2"}}
        // {"seq":118,"type":"request","command":"evaluate","arguments":{"expression":"a()","frame":3,"disable_break":false}}
        // {"seq":119,"type":"request","command":"evaluate","arguments":{"expression":"[o.a,o.b,o.c]","global":true,"disable_break":true}}
        it("should raw write", function() {
          spy.spyOn(raw_write, function() {
            evaluator.run("1+2");
            spy.intercepted(raw_write, "run").should.be(true);
          });
        });

        it("should raw write with the expression", function() {
          spy.spyOn(raw_write, function() {
            evaluator.run("1+2");
            spy.intercepted(raw_write, "run", function(obj) {
              obj.type.should.equal("request");
              obj.command.should.equal("evaluate");
              obj.arguments.expression.should.equal("1+2");
            });
          });
        });

        it("should use the correct expression", function() {
          spy.spyOn(raw_write, function() {
            evaluator.run("a()");

            spy.intercepted(raw_write, "run", function(obj) {
              obj.arguments.expression.should.equal("a()");
            });
          });
        });
      });

      // verbose: >>> Content-Length: 73
      // verbose: >>>
      // verbose: >>> {"type":"request","command":"evaluate","arguments":{"expression":"1+1"}}
      // verbose: >>>
      // verbose: <<< Content-Length: 147
      // verbose: <<<
      // verbose: <<< {"seq":4,"type":"response","command":"evaluate","success":true,"body":{"handle":13,"type":"number","value":2,"text":"2"},"refs":[],"running":false}
      describe("output", function() {
        before_each(function() {
          event_listner = ndb.EventListener;
        });

        it("should ouptut the text with an arrow", function() {
          var json = '{"seq":4,"type":"response","command":"evaluate","success":true,"body":{"handle":13,"type":"number","value":2,"text":"2"},"refs":[],"running":false}';

          spy.spyOn(ndb.Helpers, function() {
            event_listner.receive(json);

            spy.intercepted(ndb.Helpers, "puts", function(text) {
              text.should.equal("=> 2");
            });
          });
        });

        it("should output the correct text", function() {
          var json = '{"seq":4,"type":"response","command":"evaluate","success":true,"body":{"handle":13,"type":"number","value":3,"text":"3"},"refs":[],"running":false}';

          spy.spyOn(ndb.Helpers, function() {
            event_listner.receive(json);

            spy.intercepted(ndb.Helpers, "puts", function(text) {
              text.should.equal("=> 3");
            });
          });
        });
      });

      describe("parse", function() {
        it("should parse 'e' with a statement", function() {
          var e = evaluator.parse("e foo");
          e[0].should.equal(evaluator);
          e[1].should.equal("foo");
        });

        it("should parse 'eval' with a statement", function() {
          evaluator.parse("eval foo").toString().should.equal([evaluator, "foo"].toString());
        });

        it("should render the correct text", function() {
          var e = evaluator.parse("e {}");
          e[0].should.equal(evaluator);
          e[1].should.equal("{}");
        });

        it("should parse 'print' with some text", function() {
          var e = evaluator.parse("print {}");
          e[0].should.equal(evaluator);
        });
      });
    });
  });
});