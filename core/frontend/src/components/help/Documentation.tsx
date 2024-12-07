// core/frontend/src/components/help/Documentation.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  TreeView,
  TreeItem,
  Breadcrumbs,
  Link,
  Drawer,
  useTheme,
  useMediaQuery,
  IconButton,
  Divider,
  Button,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface DocSection {
  id: string;
  title: string;
  content?: string;
  children?: DocSection[];
  path: string[];
  tags?: string[];
}

interface DocumentationProps {
  sections: DocSection[];
  onSearch?: (query: string) => Promise<DocSection[]>;
  onFeedback?: (docId: string, helpful: boolean) => Promise<void>;
}

const Documentation: React.FC<DocumentationProps> = ({
  sections,
  onSearch,
  onFeedback
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DocSection[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocSection | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    // Load bookmarks from localStorage
    const savedBookmarks = localStorage.getItem('docBookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      if (onSearch) {
        const results = await onSearch(query);
        setSearchResults(results);
      } else {
        // Local search implementation
        const results = searchDocs(sections, query);
        setSearchResults(results);
      }
    } finally {
      setLoading(false);
    }
  };

  const searchDocs = (docs: DocSection[], query: string): DocSection[] => {
    const results: DocSection[] = [];
    const searchTerm = query.toLowerCase();

    const searchInSection = (section: DocSection) => {
      if (
        section.title.toLowerCase().includes(searchTerm) ||
        section.content?.toLowerCase().includes(searchTerm) ||
        section.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      ) {
        results.push(section);
      }
      section.children?.forEach(searchInSection);
    };

    docs.forEach(searchInSection);
    return results;
  };

  const handleDocSelect = (doc: DocSection) => {
    setSelectedDoc(doc);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const toggleBookmark = (docId: string) => {
    const newBookmarks = bookmarks.includes(docId)
      ? bookmarks.filter(id => id !== docId)
      : [...bookmarks, docId];
    
    setBookmarks(newBookmarks);
    localStorage.setItem('docBookmarks', JSON.stringify(newBookmarks));
  };

  const renderTreeItems = (sections: DocSection[]) => {
    return sections.map((section) => (
      <TreeItem
        key={section.id}
        nodeId={section.id}
        label={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            {section.title}
            {bookmarks.includes(section.id) && (
              <BookmarkIcon fontSize="small" color="primary" />
            )}
          </Box>
        }
        onClick={() => handleDocSelect(section)}
      >
        {section.children && renderTreeItems(section.children)}
      </TreeItem>
    ));
  };

  const renderContent = () => {
    if (!selectedDoc) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight={400}
        >
          <Typography variant="h6" color="textSecondary">
            Select a document to view
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Breadcrumbs>
            {selectedDoc.path.map((item, index) => (
              <Link
                key={index}
                color="inherit"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // Handle breadcrumb navigation
                }}
              >
                {item}
              </Link>
            ))}
          </Breadcrumbs>
          <IconButton
            onClick={() => toggleBookmark(selectedDoc.id)}
          >
            {bookmarks.includes(selectedDoc.id) ? (
              <BookmarkIcon color="primary" />
            ) : (
              <BookmarkBorderIcon />
            )}
          </IconButton>
        </Box>

        <Typography variant="h5" gutterBottom>
          {selectedDoc.title}
        </Typography>

        {selectedDoc.tags && (
          <Box mb={2}>
            {selectedDoc.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{ mr: 1 }}
              />
            ))}
          </Box>
        )}

        <Box mb={4}>
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
            {selectedDoc.content || ''}
          </ReactMarkdown>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="textSecondary">
            Was this helpful?
          </Typography>
          <Box>
            <IconButton
              onClick={() => onFeedback?.(selectedDoc.id, true)}
            >
              <ThumbUpIcon />
            </IconButton>
            <IconButton
              onClick={() => onFeedback?.(selectedDoc.id, false)}
            >
              <ThumbDownIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box display="flex">
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 300,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 300,
            boxSizing: 'border-box',
            position: isMobile ? 'fixed' : 'relative'
          }
        }}
      >
        <Box p={2}>
          <TextField
            fullWidth
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Divider />

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : searchQuery ? (
          <List>
            {searchResults.map((result) => (
              <ListItem
                key={result.id}
                button
                onClick={() => handleDocSelect(result)}
              >
                <ListItemText
                  primary={result.title}
                  secondary={result.path.join(' > ')}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <TreeView
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
          >
            {renderTreeItems(sections)}
          </TreeView>
        )}
      </Drawer>

      <Box flex={1} p={3}>
        {isMobile && (
          <IconButton
            sx={{ mb: 2 }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Paper sx={{ p: 3 }}>
          {renderContent()}
        </Paper>
      </Box>
    </Box>
  );
};

export default Documentation;
