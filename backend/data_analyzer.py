import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from mpl_toolkits.mplot3d import Axes3D
from datetime import datetime
import warnings
import os

warnings.filterwarnings('ignore')

class DataAnalyzer:
    """Professional Data Analysis Engine - Dynamic & Robust"""
    
    def __init__(self, csv_file):
        self.df = pd.read_csv(csv_file)
        # Clean column names
        self.df.columns = [str(col).strip() for col in self.df.columns]
        
        self.analysis_results = {}
        self.charts = {}
        self.timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Identify column types
        self.numeric_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()
        self.categorical_cols = self.df.select_dtypes(include=['object', 'category']).columns.tolist()
        self.date_cols = []
        
        # Try to identify date columns
        for col in self.categorical_cols:
            if 'date' in col.lower() or 'time' in col.lower():
                try:
                    self.df[col] = pd.to_datetime(self.df[col])
                    self.date_cols.append(col)
                    self.categorical_cols.remove(col)
                except:
                    pass

    def perform_analysis(self):
        """Execute comprehensive data analysis"""
        print("[*] Starting dynamic data analysis...")
        print(f"[*] Dataset size: {len(self.df):,} rows, {len(self.df.columns)} columns")
        
        try:
            # 1. Basic Overview
            self.analysis_results['basic_stats'] = self._get_basic_stats()
            
            # 2. Numeric Analysis
            if self.numeric_cols:
                self.analysis_results['numeric_analysis'] = self._analyze_numeric_columns()
            
            # 3. Categorical Analysis
            if self.categorical_cols:
                self.analysis_results['categorical_analysis'] = self._analyze_categorical_columns()
            
            # 4. Time Series Analysis (if dates exist)
            if self.date_cols and self.numeric_cols:
                self.analysis_results['temporal_analysis'] = self._analyze_temporal_data()
            
            # 5. Correlation Analysis
            if len(self.numeric_cols) > 1:
                self.analysis_results['correlations'] = self._analyze_correlations()
            
            print("[✓] Analysis completed successfully!")
            return self.analysis_results
        except Exception as e:
            print(f"[✗] Error during analysis: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
    
    def _get_basic_stats(self):
        """Calculate dataset overview statistics"""
        return {
            'total_records': len(self.df),
            'total_columns': len(self.df.columns),
            'numeric_columns': len(self.numeric_cols),
            'categorical_columns': len(self.categorical_cols),
            'date_columns': len(self.date_cols),
            'missing_values': self.df.isnull().sum().sum(),
            'duplicate_rows': self.df.duplicated().sum()
        }
    
    def _analyze_numeric_columns(self):
        """Detailed analysis of numeric columns"""
        stats = {}
        for col in self.numeric_cols:
            stats[col] = {
                'mean': self.df[col].mean(),
                'median': self.df[col].median(),
                'std': self.df[col].std(),
                'min': self.df[col].min(),
                'max': self.df[col].max(),
                'zeros': (self.df[col] == 0).sum()
            }
        return stats
    
    def _analyze_categorical_columns(self):
        """Detailed analysis of categorical columns"""
        stats = {}
        for col in self.categorical_cols:
            # Limit to top 10 unique values to avoid huge reports
            value_counts = self.df[col].value_counts()
            stats[col] = {
                'unique_count': self.df[col].nunique(),
                'top_values': value_counts.head(10).to_dict(),
                'most_frequent': value_counts.index[0] if not value_counts.empty else None
            }
        return stats
    
    def _analyze_temporal_data(self):
        """Analyze trends over time using the first identified date column"""
        date_col = self.date_cols[0]
        # Group by month
        monthly_data = self.df.set_index(date_col)
        # Resample numeric cols by month (sum)
        monthly_stats = monthly_data[self.numeric_cols].resample('M').sum()
        
        return {
            'date_column': date_col,
            'date_range': f"{self.df[date_col].min()} to {self.df[date_col].max()}",
            'trends': monthly_stats.to_dict()
        }

    def _analyze_correlations(self):
        """Calculate correlation matrix"""
        corr_matrix = self.df[self.numeric_cols].corr()
        # Find strongest correlations
        correlations = []
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                col1 = corr_matrix.columns[i]
                col2 = corr_matrix.columns[j]
                val = corr_matrix.iloc[i, j]
                if abs(val) > 0.5: # Only interesting correlations
                    correlations.append({
                        'pair': f"{col1} vs {col2}",
                        'value': val
                    })
        return sorted(correlations, key=lambda x: abs(x['value']), reverse=True)

    def generate_charts(self, output_dir='charts'):
        """Generate dynamic visualizations based on data types"""
        os.makedirs(output_dir, exist_ok=True)
        print("[*] Generating visualizations...")
        
        sns.set_style("whitegrid")
        plt.rcParams['figure.facecolor'] = '#f8f9fa'
        
        chart_count = 0
        
        # 1. Numeric Distributions (Histograms)
        for i, col in enumerate(self.numeric_cols[:5]): # Limit to first 5 numeric cols
            plt.figure(figsize=(10, 6))
            sns.histplot(self.df[col], kde=True, color='#3498db')
            plt.title(f'Distribution of {col}', fontsize=14, fontweight='bold')
            plt.tight_layout()
            plt.savefig(f'{output_dir}/{chart_count:02d}_dist_{col}.png')
            plt.close()
            chart_count += 1
            
        # 2. Categorical Counts (Bar Charts)
        for i, col in enumerate(self.categorical_cols[:5]): # Limit to first 5 categorical cols
            if self.df[col].nunique() < 20: # Only if reasonable number of categories
                plt.figure(figsize=(12, 6))
                top_cats = self.df[col].value_counts().head(10)
                sns.barplot(x=top_cats.index, y=top_cats.values, palette='viridis')
                plt.title(f'Top 10 {col} Counts', fontsize=14, fontweight='bold')
                plt.xticks(rotation=45)
                plt.tight_layout()
                plt.savefig(f'{output_dir}/{chart_count:02d}_cat_{col}.png')
                plt.close()
                chart_count += 1
        
        # 3. Correlation Heatmap
        if len(self.numeric_cols) > 1:
            plt.figure(figsize=(10, 8))
            sns.heatmap(self.df[self.numeric_cols].corr(), annot=True, cmap='coolwarm', fmt='.2f')
            plt.title('Correlation Matrix', fontsize=14, fontweight='bold')
            plt.tight_layout()
            plt.savefig(f'{output_dir}/{chart_count:02d}_correlation.png')
            plt.close()
            chart_count += 1
            
        # 4. Time Series (if applicable)
        if self.date_cols and self.numeric_cols:
            date_col = self.date_cols[0]
            target_col = self.numeric_cols[0] # Plot first numeric col over time
            
            plt.figure(figsize=(12, 6))
            temp_df = self.df.sort_values(date_col)
            plt.plot(temp_df[date_col], temp_df[target_col], color='#2ecc71')
            plt.title(f'{target_col} Over Time', fontsize=14, fontweight='bold')
            plt.xticks(rotation=45)
            plt.tight_layout()
            plt.savefig(f'{output_dir}/{chart_count:02d}_time_trend.png')
            plt.close()
            chart_count += 1
            
        # 5. Scatter Plots for High Correlations
        if 'correlations' in self.analysis_results:
            for corr in self.analysis_results['correlations'][:3]: # Top 3 correlations
                cols = corr['pair'].split(' vs ')
                plt.figure(figsize=(10, 6))
                sns.scatterplot(data=self.df, x=cols[0], y=cols[1], alpha=0.6)
                plt.title(f'{cols[0]} vs {cols[1]} (Corr: {corr["value"]:.2f})', fontsize=14, fontweight='bold')
                plt.tight_layout()
                plt.savefig(f'{output_dir}/{chart_count:02d}_scatter_{cols[0]}_{cols[1]}.png')
                plt.close()
                chart_count += 1

        print(f"[✓] Generated {chart_count} charts!")
        return output_dir
