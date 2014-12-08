/** @jsx React.DOM */
var React = window.React = require('react');

var Hello = React.createClass({
  displayName: 'Hello',
  render: function () {
    return (
      <div>Hello</div>
    );
  }
});

React.render(
  <Hello />,
  document.body
);