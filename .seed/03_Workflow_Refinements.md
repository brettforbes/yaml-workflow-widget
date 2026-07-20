# Rules for the Workflow Diagram

## 1. Aim

The Aim is to define a series of rules that are explicit enough to be used to generate the workflow diagram from a YAML file. These rules should be used to generate the diagram in a way that is consistent and predictable, regardless of the complexity of the workflow. We should aim to define a "Pretty Print" function that can be used to correct the layout, if the User has moved objects around during editing.

## 2. Key Components

The following are the key components that we need to define the rules for.

### 2.1 Valid Workflow Shapes

The entire workflow diagram can be composed only of the following workflow-shapes:

| workflow-shape | width | height | base-shape | line-thickness |
| --- | ---: | ---: | --- | ---: |
| transition | 72 | 72 | circle | 2 |
| target | 140 | 48 | rounded-rect | 1 |
| default_step | 180 | 64 | rounded-rect | 1 |
| mirror_step | 180 | 64 | rounded-rect | 1 |
| port | 12 | 12 | circle | 1 |
| sub-step | 160 | 56 | rounded-rect | 1 |
| collector | 32 | 32 | circle | 1 |

Note that a target step has an input port at the centre of the top edge and an output port at the centre of the bottom edge.

### 2.2 default_step components

| label | shape | width | height | x | y |
| --- | --- | ---: | ---: | ---: | ---: |
| default_step_expand_plus | rounded-rect | 24 | 24 | 13 | 20 |
| default_step | text | 75 | 20 | 45 | 22 |
| default_step_context_port | circle | 12 | 12 | 174 | 25 |
| default_step_input_port | circle | 12 | 12 | 84 | -6 |
| default_step_output_port | circle | 12 | 12 | 84 | 58 |

### 2.3 mirror_step components

| label | shape | width | height | x | y |
| --- | --- | ---: | ---: | ---: | ---: |
| mirror_step | text | 73 | 20 | 62 | 22 |
| mirror_step_expand_plus | rounded-rect | 24 | 24 | 143 | 20 |
| mirror_step_context_port | circle | 12 | 12 | -6 | 25 |
| mirror_step_input_port | circle | 12 | 12 | 84 | -6 |
| mirror_step_output_port | circle | 12 | 12 | 84 | 58 |

### 2.4 Expanded Step dimensions

When the expansion cross is clicked, the step is expanded to contain the input, config, context and output components. In order to contain the input, config, context and output sub-steps, the expanded step rounded-rect must be at least 214 wide and 528 high. All of the components and edges underneath the expanded step are pushed down by the delta height of the expanded step ( delta = 528−64). 

Importantly, when the step is expanded, the cross icon must be swapped for a minus icon. When the minus icon is clicked, the step is collapsed back to the original size. 

The dimensions of these sub-steps are relative to the expanded step rounded-rect top-left, and are as follows:

| label | shape | width | height | x | y |
| --- | --- | ---: | ---: | ---: | ---: |
| input | rounded-rect | 160 | 56 | 36 | 56 |
| config | rounded-rect | 160 | 56 | 36 | 168 |
| context | rounded-rect | 160 | 56 | 36 | 280 |
| output | rounded-rect | 160 | 56 | 36 | 392 |

### 2.5 Edge Function

Edges can only issue from a port's perimeter, the perimeter of a collector circle, or the perimeter of a transition circle and must end on another port's perimeter, the perimeter of a collector circle, or the perimeter of a transition circle. A function is needed that can take a source and target port pair, and return an edge-shape that is valid for that pair. If the edge was extended past the perimeter, then it would pass through the centre of the circle.

### 2.6 Edge Types

There can only be a single edge coming into the input port of any step. There are only three types of edges:

- `followed-by` -> identifies a flow of sequence, the output port of one step to input port of another step. It can only be used if there is no input to a step
- `used-by` -> identifies a flow of output port of one step to input port of another step, and it overwrites any potential `followed-by` edge that may come to that input port.
- `semantic` -> identifies a flow from the context port of one step to the context collector for that step, or from one context collector to the next context collector, or from the last context collector to the context transition.

Use straight vertical or horizontal edges where you can but prefer orthogonal edges over diagonal edges.

### 2.7 Context Collectors

Every time a default step is created, it must have a context collector to its right, so the the horizontal centre line of the step and the collector are the same, and a `semantic` edge must be drawn from the context port of the step to the context collector. If it is a split, then the `collector` may be in the middle, and hence the `default_step` and the `mirror_step` can both share it.
Every time a mirror step is created, it must have a context collector to its left, so the the horizontal centre line of the step and the collector are the same, and a `semantic` edge must be drawn from the context port of the step to the context collector, so it is a mirror edge pointing left. If it is a split, then the `collector` may be in the middle, and hence the `default_step` and the `mirror_step` can both share it.


### 2.8 Connecting Context Collectors to the context transition

An edge must always be drawn from the first context collector to the second context collector, and so on, until all context collectors are connected by a `semantic` edge. A `semantic` edge must connect the last context collector to the context transition.


## 3. Rules for Layout

The aim is to define a set of rules so the "pretty print" function can be used to correct the layout unambiguously, if the User has moved objects around during editing.

**Default spacing (applies to all layouts unless an exception is stated):**

- **150 px** vertical spacing between the centre lines (`cy`) of each successive row of shapes. This is the default row pitch for Pretty Print.
- **180 px** from a centre `default_step` down to the first fan-out (split) row, so diagonal edges are less steep.
- **90 px** between the right edge of a `default_step` and the **centre** of its collector.
- **90 px** between the left edge of a `mirror_step` and the **centre** of its collector.

### 3.1 Simple Layout

see this file `.seed\12A2_Workflow_YAML_Example.yaml`, and the explanation below

The `start` transition is always at the top of the workflow diagram, and the `context` transition is always at the bottom of the workflow diagram. The `start` transition is setup first, and is generally setup at the top and rough centre of the screen.

Following the `start` there are two options, either there is an immediate `target` step, or there is a `default_step` step following the `start` transition.

In the scenario below, you can see that there is no `target` step, and so you know that the first edge must be a `followed-by` edge from the `start` transition to the input port of the `default_step`. The default step is laid out on the same vertical centre line as the `start` transition.

As discussed above, a `context collector` is always laid out to the right of the `default_step`, and a `semantic` edge is always drawn from the `context port` of the `default_step` to the `context collector`. The context collector is laid out on the same horizontal centre line as the `default_step`.

Then, the last item in the sequence is the `context` transition. This is always laid out at the bottom of the workflow diagram, and is always laid out on the same vertical centre line as the `start` transition. Finally, a `semantic` edge is drawn from the `context collector` to the `context` transition.

These rules then lead to the following layout (all numbers are in pixels):

| workflow-icon | type | x | y | cx | cy |
| --- | --- | ---: | ---: | ---: | ---: |
| start | transition | 355 | 0 | 391 | 36 |
| sfp_cli_netdiscover | default_step | 301 | 154 | 391 | 186 |
| context_collector_1 | collector | 555 | 170 | 571 | 186 |
| context | transition | 355 | 300 | 391 | 336 |

### 3.2 Complex Layout

see this file `.seed\12A_Workflow_YAML_Example.yaml`, and the explanation below

The `start` transition is always at the top of the workflow diagram, and the `context` transition is always at the bottom of the workflow diagram. The `start` transition is setup first, and is generally setup at the top and rough centre of the screen.

Following the `start` there are two options, either there is an immediate `target` step, or there is a `default_step` step following the `start` transition.

In the scenario below, you can see that there is a `target` step, and so you know that the first edge must be a `used-by` edge from the `start` transition to the input port of the `target`. The target step is laid out on the same vertical centre line as the `start` transition.

The first step is a `default_step`, and is laid out on the same vertical centre line as the `start` transition.

As discussed above, a `context collector` is always laid out to the right of the `default_step`, and a `semantic` edge is always drawn from the `context port` of the `default_step` to the `context collector`. The context collector is laid out on the same horizontal centre line as the `default_step`.

Immediately below this we see that the output of step 1 (`sfp_cli_subfinder`) is used by both step 2 (`sfp_cli_httpx`) and step 4 (`sfp_cli_nmap`), and so you know there must be a split, because two subsequent steps require the same input (i.e. they are in parallel, not sequence).

In order to do the split we establish the following rules:

- A chain is created when a step uses the output of a previous step as its input, and in this case lay out the longest chain on the left and the shortest chain on the right. If they are both the same length, then chose the first one in YAML sequence as the left hand chain.
- The left hand vertical chain of steps is laid out so the right hand edge of the `default_step` is aligned with the left hand edge of the splitting `default_step`.
- The right hand vertical chain of steps is laid out so the left hand edge of the `mirror_step` is aligned with the right hand edge of the splitting `default_step`
- The `context collector` for the left hand vertical chain of steps is laid out on the same horizontal centre line as the `default_step` for the left hand vertical chain of steps, and the the `mirror_step` for the right hand vertical chain of steps.
- The `semantic` edge from the `context port` of the `default_step` for the left hand vertical chain of steps is drawn to the `context collector` for the left hand vertical chain of steps.
- The `semantic` edge from the `context port` of the `mirror_step` for the right hand vertical chain is drawn left to the shared `context collector` for that row.
- A `semantic` edge is drawn from the first `context collector` step 1 (`sfp_cli_subfinder`) to the `context collector` for the split steps.

This logic is then repeated for the rest of the steps in the workflow. Finally, a `semantic` edge is drawn from the last `context collector` to the `context` transition.

These rules then lead to the following layout (all numbers are in pixels):

| workflow-icon | type | x | y | cx | cy |
| --- | --- | ---: | ---: | ---: | ---: |
| start | transition | 355 | 0 | 391 | 36 |
| target | target | 321 | 162 | 391 | 186 |
| sfp_cli_subfinder | default_step | 301 | 304 | 391 | 336 |
| context_collector_1 | collector | 555 | 320 | 571 | 336 |
| sfp_cli_httpx | default_step | 121 | 484 | 211 | 516 |
| context_collector_2 | collector | 375 | 500 | 391 | 516 |
| sfp_cli_nmap | mirror_step | 481 | 484 | 571 | 516 |
| sfp_cli_katana | default_step | 121 | 634 | 211 | 666 |
| context_collector_3 | collector | 375 | 650 | 391 | 666 |
| sfp_cli_nerva | mirror_step | 481 | 634 | 571 | 666 |
| sfp_cli_nuclei | default_step | 121 | 784 | 211 | 816 |
| context_collector_4 | collector | 375 | 800 | 391 | 816 |
| context | transition | 355 | 930 | 391 | 966 |

### 3.3. Edges for Expanded Steps

When the step is expanded, the four internal steps are revealed. Internal steps are to be drawn with input and output ports, except for the `context` step which also has a context port. The edges are drawn as follows:

- A `used-by` edge is drawn from the output port of the `input` sub-step (the first internal step) to the input port of the second internal step `config`.
- A `used-by` edge is drawn from the output port of the `config` sub-step (the second internal step) to the input port of the third internal step `context`.
- A `used-by` edge is drawn from the output port of the `context` sub-step (the third internal step) to the input port of the fourth internal step `output`.
- A `semantic` edge is drawn from the context port of the `context` sub-step to the  for the expanded step to the context port of the expanded step. (Note this rule may create unecessary visual complexity inside  the expanded step,and may be removed later if required)
- A `semantic` edge is drawn from the context port of the expanded step to the context collector for the expanded step.

### 3.4. Rules for more than two chains

When there are more than 2 steps that share an input from a previous step, or share the target of the workflow, then multiple splits must be made so there is a vertical line for each chain. The rules for the splits are as follows:

- use all of the rules from above, except that the odd numbered chains are `default_step` steps and the even numbered chains are `mirror_step` steps, so 4 steps would have two central collectors, one for each default/mirror chain pair.
- setup dimensions of the additional columns and collectors so the whole workflow diagram is centralised around the start and context transitions