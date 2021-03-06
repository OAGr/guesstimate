'use strict';

import _ from 'lodash'

import $ from 'jquery'
import React from 'react'
import Reflux from 'reflux'
import FermActions from '../actions'
import Cytoscape from 'lib/components/cytoscape'

const GraphPane = React.createClass( {
  handleReady (cytoscapeGraph) {
    this.setState({graph: cytoscapeGraph})
    this.updateAllPositions(cytoscapeGraph)
  },
  handleChange (cytoscapeGraph) {
    this.updateAllPositions(cytoscapeGraph)
  },
  handleDrag (event) {
    const id = event.cyTarget.data().nodeId;
    const renderedPosition = event.cyTarget.renderedPosition()
    const position = event.cyTarget.position()
    const object = {id: id, renderedPosition: renderedPosition, position: position}
    FermActions.updateNodeLocations([object])
  },
  handlePan (event) {
    const newLocations = _.map(event.cy.nodes(), function(n){return {id: n.data().nodeId, renderedPosition: n.renderedPosition(), position: n.position()}})
    FermActions.updateNodeLocations(newLocations);
  },
  handleTap (event) {
    const data = event.cyTarget.data()
    if (data) {
      this.props.updateEditingNode(data.nodeId)
    } else {
      this.props.updateEditingNode(null)
    }
  },
  updateAllPositions () {
    const newLocations = _.map(this.state.graph.nodes(), function(n){return {id: n.data().nodeId, renderedPosition: n.renderedPosition(), position: n.position()}})
    if ((newLocations.length != 0) && (!isNaN(newLocations[0].renderedPosition.x))){
      FermActions.updateAllNodeLocations(newLocations);
    }
  },
  prepareElements () {
    return this.props.graph.toCytoscape({editingNode: this.props.editingNode})
  },
  makeConfig () {
    return {
      container: $('.cytoscape_graph')[0],
      userZoomingEnabled: true,
      maxZoom: 2,
      minZoom: 0.5,
      style: cytoscapeStyle,
      elements: this.prepareElements(),
      layout: { name: 'preset' }
    }
  },
  render () {
    const graph = (<Cytoscape config={this.makeConfig()} elements={this.prepareElements()} onDrag={this.handleDrag} onReady={this.handleReady} onChange={this.handleChange} onPan={this.handlePan} onTap={this.handleTap}/>)
    const isReady = (this.prepareElements().nodes.length !== 0)
    const element = isReady ? graph : false
    return (
      element
    )
  }
})

const cytoscapeStyle = cytoscape.stylesheet()
  .selector('node')
    .css({
      'font-weight': 'normal',
      'content': 'data(name)',
      'font-size': 14,
      'text-valign': 'center',
      'text-halign': 'center',
      'background-color': '#fff',
      'text-outline-color': '#fff',
      'text-outline-width': 4,
    })
  .selector('node[nodeType="function"]')
      .css({
        'color': '#8E3C3A',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': 30,
        'width': 40,
        'height': 40,
    })
  .selector('node[nodeType="estimate"]')
      .css({
        'width': 80,
        'font-weight': 'bold',
        'height': 25,
        'color': '#444',
    })
  .selector('node[nodeType="dependent"]')
      .css({
        'color': '#8E3C3A',
        'width': 80,
        'font-weight': 'bold',
        'height': 25,
    })
  .selector('node[name="Add Name"]')
      .css({
        'color': 'red',
    })
  .selector('node[editing="true"]')
      .css({
        'color': '#1E8AE2',
    })
  .selector('edge')
    .css({
      'target-arrow-shape': 'triangle',
      'width': 2,
      'line-color': '#ddd',
      'target-arrow-color': '#666'
    })
  .selector('edge[toType="dependent"]')
    .css({
      'line-color': '#994343',
      'target-arrow-color': '#994343'
    })

module.exports = GraphPane;
