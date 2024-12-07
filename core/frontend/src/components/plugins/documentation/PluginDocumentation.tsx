// core/frontend/src/components/plugins/documentation/PluginDocumentation.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Breadcrumbs,
  Link,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Code as CodeIcon,
  Book as BookIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface DocSection {
  id: string;
  title: string;
  content: string;
  subsections?: DocSection[];
}

interface PluginDocumentationProps {
  pluginId: string;
}

const PluginDocumentation: React.FC<PluginDocumentationProps> = ({ pluginId }) => {
  const [docs, setDocs] = useState<DocSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchDocumentation();
  }, []);

  const fetchDocumentation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/plugins/${pluginId}/documentation`);
      const data = await response.json();
      setDocs(data);
      if (data.length > 0) {
        setSelectedSection(data[0].id);
      }
    } catch (err) {
      setError('Failed to load documentation');
    } finally {
      setLoading(false);
    }
  };

  const renderDocContent = (content: string) => (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={materialDark}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );

  const findSection = (sections: DocSection[], id: string): DocSection | null => {
    for (const section of sections) {
      if (section.id === id) return section;
      if (section.subsections) {
        const found = findSection(section.subsections, id);
        if (found) return found;
      }
    }
    return null;
  };

  const renderSidebarItems = (sections: DocSection[], depth = 0) => (
    <List dense={depth > 0}>
      {sections.map((section) => (
        <React.Fragment key={section.id}>
          <ListItemButton
            selected={selectedSection === section.id}
            onClick={() => setSelectedSection(section.id)}
            sx={{ pl: 2 * (depth + 1) }}
          >
            <ListItemText primary={section.title} />
          </ListItemButton>
          {section.subsections && renderSidebarItems(section.subsections, depth + 1)}
        </React.Fragment>
      ))}
    </List>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const currentSection = findSection(docs, selectedSection);

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            position: 'relative'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />
            }}
          />
        </Box>
        <Divider />
        {renderSidebarItems(docs)}
      </Drawer>

      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <IconButton
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab icon={<BookIcon />} label="Guide" />
            <Tab icon={<CodeIcon />} label="API Reference" />
            <Tab icon={<BuildIcon />} label="Examples" />
          </Tabs>
        </Box>

        {currentSection && (
          <>
            <Breadcrumbs sx={{ mb: 2 }}>
              <Link href="#" onClick={() => setSelectedSection(docs[0].id)}>
                Documentation
              </Link>
              <Typography color="text.primary">
                {currentSection.title}
              </Typography>
            </Breadcrumbs>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>
                {currentSection.title}
              </Typography>
              {renderDocContent(currentSection.content)}
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
};

export default PluginDocumentation;
