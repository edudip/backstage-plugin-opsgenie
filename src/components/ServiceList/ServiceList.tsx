import React, { useEffect } from 'react';
import { opsgenieApiRef } from '../../api';
import { Progress, ItemCardGrid, StatusOK, StatusError, StatusWarning, StatusRunning } from "@backstage/core-components";
import { useApi } from '@backstage/core-plugin-api';
import { useAsync } from "react-use";
import Alert from "@material-ui/lab/Alert";
import { Card, CardContent, createStyles, TextField, InputAdornment, makeStyles, Tooltip, colors } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { Incident, Service } from '../../types';
import { Pagination } from '@material-ui/lab';
import SearchIcon from '@material-ui/icons/Search';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Chip from '@material-ui/core/Chip';
import {IncidentTimeline} from './IncidentTimeline';
import { PriorityChip } from '../UI/PriorityChip';
import { NiceDate } from '../UI/NiceDate';

const useStyles = makeStyles((theme) =>
  createStyles({
    pagination: {
      marginTop: theme.spacing(2),
    },
    search: {
      marginBottom: theme.spacing(2),
    },
    onCallItemGrid: {
        gridTemplateColumns: 'repeat(auto-fill, 100%)',
    }
  }),
);

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = React.useState(value);

    useEffect(
      () => {
        // Update debounced value after delay
        const handler = setTimeout(() => {
          setDebouncedValue(value);
        }, delay);

        // Cancel the timeout if value changes (also on delay change or unmount)
        // This is how we prevent debounced value from updating if value is changed ...
        // .. within the delay period. Timeout gets cleared and restarted.
        return () => {
          clearTimeout(handler);
        };
      },
      [value, delay] // Only re-call effect if value or delay changes
    );

    return debouncedValue;
}

const ServiceDetailsCard = ({ service }: { service: Service }) => {
    const useStyles = makeStyles({
        root: {
          minWidth: 275,
        },
        bullet: {
          display: 'inline-block',
          margin: '0 2px',
          transform: 'scale(0.8)',
        },
        title: {
          fontSize: 14,
        },
        pos: {
          marginBottom: 12,
        },
        incidentHeading: {
          fontSize: 16,
          fontWeight: 500,
        },
        incidentLabels: {
            marginTop: '4px',
            display: 'flex'
        },
        incidentDates: {
            fontWeight: 500,
            fontSize: 15,
            color: colors.grey['400'],
        }, 
        statusWrapper: {
            display: 'inline-block',
        }
      });
      

    const title = (
        <div style={ {display: "flex"} }>
            <div>{ service._incidents.length > 0 ? <StatusError /> : <StatusOK />}</div>
            {service.name}
        </div>
    );

    const classes = useStyles();

    const incidents = []
    for (const incident of service._incidents) {

        let priority = <Tooltip title="Critical" placement="left"><div className={classes.statusWrapper}><StatusError /></div></Tooltip>
        switch(incident.priority){
            case 'P2':
                priority = <Tooltip title="High" placement="left"><div className={classes.statusWrapper}><StatusWarning /></div></Tooltip>
                break;
            case 'P3':
                priority = <Tooltip title="Warning" placement="left"><div className={classes.statusWrapper}><StatusWarning /></div></Tooltip>
                break;
            case 'P4':
                priority = <Tooltip title="Low" placement="left"><div className={classes.statusWrapper}><StatusRunning /></div></Tooltip>
                break;
            case 'P5':
                priority = <Tooltip title="Informational" placement="left"><div className={classes.statusWrapper}><StatusRunning /></div></Tooltip>
                break;
        }

        incidents.push(
            <Accordion key={incident.id}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id={incident.id + "-header"}
                >
                    <div style={ {display: "flex", alignItems: 'center', flexGrow: 1 } }>
                        <div style={ {marginRight: "10px"} }>{ priority }</div>
                        <div style={ {display: "flex", flexDirection: 'column', flexGrow: 1 } }>
                            <div className={classes.incidentHeading}>{ incident.message }</div>
                            <div className={classes.incidentLabels}>
                                <PriorityChip priority={incident.priority} />
                                <Chip label={ incident.status } size="small" />     
                            </div>
                        </div>
                        <div style={ {display: "flex", flexDirection: 'column', alignItems:"flex-end" } }>
                            <div className={classes.incidentDates}>created at: <NiceDate datetime={incident.createdAt}/></div>
                            <div className={classes.incidentDates}>updated at: <NiceDate datetime={incident.updatedAt}/></div>
                        </div>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <IncidentTimeline incident={incident} />
                </AccordionDetails>
            </Accordion>
        )
    }

    return (
        <Card>
             <CardContent>
                <Typography variant="h5" component="h2">
                { title }
                </Typography>
                <Typography className={classes.pos} color="textSecondary">
                { service.description }
                </Typography>
                {
                    incidents
                }
            </CardContent>
        </Card>
    );
};

const ServiceGrid = ({ services, incidents }: { services: Service[], incidents: Incident[] }) => {
    const classes = useStyles();
    const cardsPerPage = 6;

    services.forEach(service => {
        service._incidents = incidents.filter(i => i.impactedServices.includes(service.id))
    })

    const [results, setResults] = React.useState(services);
    const [search, setSearch] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [offset, setOffset] = React.useState(0);
    const handleChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setOffset((value - 1) * cardsPerPage);
        setPage(value);
    };
    const debouncedSearch = useDebounce(search, 300);

    // debounced search
    useEffect(
        () => {
            if (!debouncedSearch) {
                setResults(services);
                return;
            }

            const filtered = services.filter(service => {
                return service.name.toLowerCase().includes(debouncedSearch.toLowerCase());
            });
            setResults(filtered);
        },
        [debouncedSearch, services]
      );

    return (
        <div>
            <TextField
                fullWidth
                variant="outlined"
                className={classes.search}
                placeholder="Service…"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    )
                }}
                onChange={e => setSearch(e.target.value)}
            />

            <ItemCardGrid classes={{root: classes.onCallItemGrid}}>
                {results.filter((_, i) => i >= offset && i < offset + cardsPerPage).map(service => <ServiceDetailsCard key={service.id} service={service} />)}
            </ItemCardGrid>

            <Pagination
                className={classes.pagination}
                count={Math.ceil(results.length / cardsPerPage)}
                page={page}
                onChange={handleChange}
                showFirstButton
                showLastButton
            />
        </div>
    );
};

export const ServiceList = () => {
    const opsgenieApi = useApi(opsgenieApiRef);
    const { value, loading, error } = useAsync(async () => {
        const services = await opsgenieApi.getServices()
        const incidents = await opsgenieApi.getIncidents({limit: 50, query: 'status:open'})
        return {
            services,
            incidents
        }
    });

    if (loading) {
        return <Progress />;
    } else if (error) {
        return (
            <Alert data-testid="error-message" severity="error">
                {error.message}
            </Alert>
        );
    }

    return <ServiceGrid services={value!.services!} incidents={value!.incidents!} />;
};
