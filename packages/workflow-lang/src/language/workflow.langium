/**
 * SpiderFeet Workflow + GSE — Langium grammar stub (SPEC-008 / E8-S1).
 *
 * Canonical YAML interchange remains SPEC-007 (12A/12B/12C + JSON Schema).
 * This surface syntax is an editor/AST tooling layer; do not invent operators
 * absent from those contracts. E8-S2 expands 1:1 coverage of the YAML AST.
 */
grammar SfWorkflow

entry Workflow:
    'workflow' name=ID '{'
        'apiVersion' apiVersion=STRING
        'kind' kind=STRING
        ('id' workflowId=STRING)?
        (info=Info)?
        (inputs+=InputDecl)*
        (steps+=Step)*
    '}';

Info:
    'info' '{'
        'name' name=STRING
        ('description' description=STRING)?
        ('author' author=STRING)?
    '}';

InputDecl:
    'input' name=ID '{'
        'type' type=STRING
        ('default' defaults+=STRING)*
    '}';

Step:
    'step' name=ID '{'
        'uses' uses=STRING
        ('needs' needs+=[Step:ID] (',' needs+=[Step:ID])*)?
        (input=StepInput)?
        // GSE / config / context expanded in E8-S2
    '}';

StepInput:
    'input' '{'
        'from' from=STRING
        ('normalize' normalize=STRING)?
        ('empty' empty=STRING)?
    '}';

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;

terminal ID: /[_a-zA-Z][\w_]*/;
terminal STRING: /"(\\.|[^"\\])*"/;
