'use strict';

var numeral = require("numeral");
var functionOperations = require("../lib/function_operations");
var AbstractNode = require("./abstract_node");

class FunctionNode extends AbstractNode {

  ttype() { return 'function' }

  defaults() {
    return  {
      "functionType": 'addition'
    }
  }

  efunction() {
    var functionType = this.get('functionType')
    return functionOperations[functionType]
  }

  remove() {
    this.dependent().remove()
    super.remove()
  }

  dependent() {
    return this.outputs.nodes()[0]
  }

  propogate() {
    this.dependent().propogate()
  }

  calculate_output() {
    var clean = function(e) {
      if (e) { return parseFloat(e) }
      else { return 0 }
    }
    var inputValues = this.inputValues().map(clean)
    return this.efunction().apply(inputValues)
  }

  toCytoscapeName() {
    return this.efunction().sign
  }

  getEdges(direction, edgeIds) {
    if (direction === 'input') {
      var edges = this.inputEdges()
      var place = 0
    }
    else {
      var edges = this.outputEdges()
      var place = 1
    }
    return _.map(edgeIds, function(edgeId) {
       return _.find(edges, function(l) {return l.get(place) == edgeId})
    })
  }

  createInputEdge(toId) {
    this.collection.graph.edges.create( {0:toId, 1: this.id})
  }

  resetInputs() {
    var newInputs = _.map(this.get('inputs'), function(n){return parseInt(n)})
    var oldInputs = this.inputs.nodeIds()
    var shouldAdd = _.difference(newInputs, oldInputs)
    var shouldDelete = _.difference(oldInputs, newInputs)
    var shouldDeleteEdges = this.inputs.getEdges(shouldDelete)
    _.map(shouldDeleteEdges, function(n){n.destroy()})
    _.map(shouldAdd, function(n){this.inputs.createEdge(n)}, this)
  }

  setup() {
    this.on('change:inputs', function(f){ f.resetInputs() })
  }
}

module.exports = FunctionNode
