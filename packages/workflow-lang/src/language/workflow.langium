/**
 * SpiderFeet Workflow + GSE — Langium grammar (SPEC-008 / E8-S2).
 *
 * Maps 1:1 to YAML AST concepts in workflow_v1.schema.json + gse_v1.schema.json
 * / 12A–12C. Surface syntax is Langium-native for editor tooling; YAML remains
 * canonical interchange (SPEC-007). Do not invent operators absent from those
 * contracts.
 */
grammar SfWorkflow

entry Workflow:
    'workflow' name=ID '{'
        'apiVersion' apiVersion=STRING
        'kind' kind=STRING
        ('id' workflowId=STRING)?
        (info=Info)?
        (inputs+=InputDecl)*
        (steps+=Step)+
    '}';

Info:
    'info' '{'
        'name' name=STRING
        ('description' description=STRING)?
        ('author' author=STRING)?
        ('created' created=STRING)?
    '}';

InputDecl:
    'input' name=ID '{'
        'type' type='string_list'
        ('description' description=STRING)?
        ('default' defaults+=STRING)*
    '}';

Step:
    'step' name=ID '{'
        'uses' uses=STRING
        ('needs' needs+=[Step:ID] (',' needs+=[Step:ID])*)?
        (input=StepInput)?
        (config=StepConfig)?
        (output=StepOutput)?
        (context=StepContext)?
    '}';

StepInput:
    'input' '{'
        'type' type='string_list'
        'from' from=STRING
        ('normalize' normalize=STRING)?
        ('empty' empty=STRING)?
    '}';

StepConfig:
    'config' '{'
        ('argv' argv+=STRING)*
        ('files' '{'
            ('input' inputFile=FileSpec)?
            ('output' outputFile=FileSpec)?
        '}')?
        ('capture' '{'
            ('family' family=STRING)?
            ('adapter' adapter=STRING)?
        '}')?
    '}';

FileSpec:
    '{'
        'mode' mode=STRING
        ('format' format=STRING)?
        ('path' path=STRING)?
    '}';

StepOutput:
    'output' '{'
        (vars+=OutputVar)*
    '}';

OutputVar:
    'var' name=ID '{'
        binding=GseBinding
    '}';

StepContext:
    'context' '{'
        'export' export=STRING
    '}';

// ---------------------------------------------------------------------------
// GSE (gse_v1.schema.json)
// ---------------------------------------------------------------------------

GseBinding:
    'type' type='string_list'
    (
        select=Select
      | 'union' '{' unionRefs+=STRING* '}'
      | 'literal' '{' literals+=STRING* '}'
      | 'from_var' fromVar=STRING
    )
    ('distinct' distinct=BOOLEAN)?;

Select:
    'select' '{'
        'source' source=STRING
        (
            nodes=NodeMatch
          | forEach=ForEach
        )
        ('project' project=STRING)?
        ('distinct' distinct=BOOLEAN)?
    '}';

NodeMatch:
    'nodes' '{'
        ('nugget_id' nuggetId=STRING)?
        ('nugget_id_in' '{' nuggetIdIn+=STRING* '}')?
        ('nugget_data_equals' nuggetDataEquals=STRING)?
        ('nugget_data_regex' nuggetDataRegex=STRING)?
        ('where' '{' where+=WherePredicate* '}')?
    '}';

WherePredicate:
    related=RelatedPredicate
  | not=NotPredicate
  | attr=AttrPredicate
;

NotPredicate:
    'not' '{'
        (related=RelatedPredicate | attr=AttrPredicate)
    '}';

RelatedPredicate:
    'related' '{'
        'direction' direction=STRING
        'relation' relation=STRING
        ('transitive' transitive=BOOLEAN)?
        ('nugget_id' nuggetId=STRING)?
        ('nugget_id_in' '{' nuggetIdIn+=STRING* '}')?
    '}';

AttrPredicate:
    'attr' '{'
        'key' key=STRING
        ('equals' equals=STRING)?
        ('regex' regex=STRING)?
    '}';

ForEach:
    'for_each' '{'
        'as' as=ID
        nodes=NodeMatch
        ('collect' '{' collects+=Collect* '}')?
        (emit=Emit)?
    '}';

Collect:
    'collect' '{'
        'as' as=ID
        (
            ('reachable_from' reachableFrom=ID
             'along' '{'
                 'relation' relation=STRING
                 ('direction' direction=STRING)?
                 ('transitive' transitive=BOOLEAN)?
             '}')?
          | nodes=NodeMatch
        )
        ('project' project=STRING)?
    '}';

Emit:
    'emit' '{'
        (
            ('product' '{' product+=ID* '}')
          | ('values' values=ID)
        )
        ('join' join=STRING)?
        ('format' format=STRING)?
    '}';

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;

terminal BOOLEAN returns boolean: /true|false/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal STRING: /"(\\.|[^"\\])*"/;
