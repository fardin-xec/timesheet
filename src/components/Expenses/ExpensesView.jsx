import React, { useState, useEffect } from 'react';
import { X, Filter, ChevronDown, AlertCircle } from 'lucide-react';
import { 
  Typography, 
  Button, 
  Box, 
  Paper,
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem
} from '@mui/material';
import '../../styles/expenses.css';
import { getExpensesData } from '../../utils/api';
import CommonDrawer from '../../components/common/Drawer'; // Import the new component

const ExpensesView = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('fromCards');
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  // const [selectedAllTransaction, setSelectedAllTransaction] = useState([]);

  const [matches, setMatches] = useState([]);
  const [matchesTab, setMatchesTab] = useState(0); // 0 for match expenses, 1 for add manually
  const [categories, setCategories] = useState([]);

  // Fetch expenses data on component mount
  useEffect(() => {
    fetchExpensesData();
  }, []);

  const fetchExpensesData = () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = getExpensesData();
      console.log(data);
      if (data) {
        setTransactions(data.transactions || []);
        setMatches(data.possibleMatches || []);
        setCategories(data.categories || []);
      } else {
        throw new Error('No expense data found');
      }
    } catch (err) {
      setError('Failed to load expense data. Please refresh the page.');
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailDrawer(true);
  };

  const formatCurrency = (amount) => {
    const prefix = amount < 0 ? '-$' : '$';
    return `${prefix}${Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const handleUpdateTransaction = (updatedTransaction) => {
    setTransactions(transactions.map(t => 
      t.id === updatedTransaction.id ? updatedTransaction : t
    ));
    setShowDetailDrawer(false);
  };

  const handleTabChange = (event, newValue) => {
    setMatchesTab(newValue);
  };

  const handleBulkAction = (selectedItems) => {
    console.log('Performing bulk action on', selectedItems.length, 'items');

    // setSelectedAllTransaction(selectedItems);

  };

  // Define the tab content for the drawer
  const drawerTabs = [
    {
      label: "Match Expenses",
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Possible Matches
          </Typography>
          
          {matches.length > 0 ? (
            <Box sx={{ mb: 4 }}>
              {matches.map(match => (
                <Paper 
                  key={match.id} 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ display: 'flex' }}>
                    <AlertCircle size={18} className="match-card-icon" />
                    <Box>
                      <Typography variant="body2">Date: {match.dateRange}</Typography>
                      <Typography variant="body2">Amount: ${match.amount.toFixed(2)}</Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                You don't have any expenses matching the selected criteria.
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
              >
                Change Criteria
              </Button>
            </Box>
          )}
          
          <Box sx={{ 
            mt: 4, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography color="text.secondary">(or)</Typography>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => setMatchesTab(1)}
            >
              Add Manually
            </Button>
          </Box>
        </Box>
      )
    },
    {
      label: "Add Manually",
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Add Transaction Manually
          </Typography>
          
          {selectedTransaction && (
            <Box component="form" sx={{ '& > *': { mb: 2 ,marginTop: 1} }}>
              <TextField
                label="Date"
                fullWidth
                defaultValue={selectedTransaction.date}
                variant="outlined"
                size="small"
              />
              
              <TextField
                label="Payee"
                fullWidth
                defaultValue={selectedTransaction.payee}
                variant="outlined"
                size="small"
              />
              
              <TextField
                label="Reference"
                fullWidth
                defaultValue={selectedTransaction.details.ref}
                variant="outlined"
                size="small"
              />
              
              <TextField
                label="Description"
                fullWidth
                defaultValue={selectedTransaction.details.description}
                variant="outlined"
                size="small"
              />
              
              <TextField
                label="Amount"
                fullWidth
                defaultValue={Math.abs(selectedTransaction.amount).toFixed(2)}
                variant="outlined"
                size="small"
              />
              
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  defaultValue=""
                  label="Category"
                >
                  {categories.map((category, index) => (
                    <MenuItem key={index} value={category.toLowerCase().replace(/\s+/g, '-')}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
      )
    }
  ];

  // Define footer actions based on the active tab
  const getFooterActions = () => {
    return {
      primaryLabel: matchesTab === 0 ? 'Match' : 'Match and Next',
      primaryAction: () => {
        if (matchesTab === 1) {
          // Logic to save changes - in a real app, you would update the transaction
          const updatedTransaction = {...selectedTransaction};
          handleUpdateTransaction(updatedTransaction);
        } else {
          setMatchesTab(1);
        }
      },
      secondaryLabel: matchesTab === 1 ? 'Cancel' : null,
      secondaryAction: () => setShowDetailDrawer(false)
    };
  };

  return (
    <div className="expenses-container">
      <div className="expenses-header">
        <div className="header-actions">
          <button className="header-button">
            <span>Add Expense</span>
          </button>
          <button className="header-button">
            <span>Bulk Add Expenses</span>
          </button>
          <button 
            className={`header-tab ${activeTab === 'fromCards' ? 'active' : ''}`}
            onClick={() => setActiveTab('fromCards')}
          >
            <span>From Cards</span>
          </button>
        </div>
        <button onClick={() => setShowDetailDrawer(false)} className="close-button">
          <X size={20} />
        </button>
      </div>

      <div className="expenses-content">
        {error && <div className="error-container">{error}</div>}
        
        <div className="content-card">
          <div className="card-header">
            <div className="header-title">
              <span className="header-title-text">Unexpensed Transactions ({transactions.length})</span>
              <ChevronDown size={20} />
            </div>
            <div>
              <button className="filter-button">
                <Filter size={18} />
              </button>
            </div>
          </div>
          
          <div>
            <table className="expenses-table">
              <thead className="table-header">
                <tr>
                  <th style={{ width: '40px' }}>
                    <input type="checkbox"
                    onClick={() => handleBulkAction(transactions)} 
                     />
                  </th>
                  <th>DATE</th>
                  <th>PAYEE</th>
                  <th>DETAILS</th>
                  <th>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="loading-container">Loading transactions...</td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="loading-container">No transactions found.</td>
                  </tr>
                ) : (
                  transactions.map(transaction => (
                    <tr 
                      key={transaction.id} 
                      className="table-row"
                      onClick={() => handleRowClick(transaction)}
                    >
                      <td className="table-cell">
                        <input 
                          type="checkbox" 
                          onClick={(e) => e.stopPropagation()} 
                        />
                      </td>
                      <td className="table-cell">
                        {transaction.date}
                      </td>
                      <td className="table-cell">
                        {transaction.payee}
                      </td>
                      <td className="table-cell">
                        <div className="cell-details-container">
                          <div className="cell-details-ref">{transaction.details.ref}</div>
                          <div className="cell-details-description">{transaction.details.description}</div>
                          <div className="cell-details-card">Card/Account Name: {transaction.details.cardAccount}</div>
                        </div>
                      </td>
                      <td className="table-cell cell-amount">
                        <div>{formatCurrency(transaction.amount)}</div>
                        {transaction.isDeposit && <div className="tag-deposit">Deposit</div>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Use the CommonDrawer component */}
      <CommonDrawer 
        open={showDetailDrawer}
        onClose={() => setShowDetailDrawer(false)}
        tabs={drawerTabs}
        activeTab={matchesTab}
        onTabChange={handleTabChange}
        footerActions={getFooterActions()}
        footerContent={<Typography color="error">Pending: $7500</Typography>}
      />
    </div>
  );
};

export default ExpensesView;